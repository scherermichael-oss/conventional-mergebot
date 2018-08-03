'use strict'

const debug = require('debug')('app:handlePullRequestChange')

const extractConventionalCommitMessage = require('./extractConventionalCommitMessage')
const getReleaseType = require('./getReleaseType')
const merge = require('./merge')
const updateLabels = require('./updateLabels')
const updateStatus = require('./updateStatus')

const handlePullRequestChange = async function (context) {
  let { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Abort.')
  }

  const message = extractConventionalCommitMessage(body)
  let releaseType = await getReleaseType(`${title}\n\n${message}`)

  debug('Release type:', releaseType)

  if (!title.match(/^(feat|fix|chore): /)) {
    debug('Title must start with \'feat: \', \'fix: \' or \'chore: \'. Reset release type.')
    releaseType = null
  }

  await updateStatus({ context, head, releaseType })
  await updateLabels({ context, number, releaseType })
  await merge({ context, title, message, head, number, releaseType })
}

module.exports = handlePullRequestChange
