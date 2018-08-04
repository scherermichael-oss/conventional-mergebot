'use strict'

const debug = require('debug')('app:handlePullRequestChange')

const extractConventionalCommitMessage = require('./extractConventionalCommitMessage')
const getReleaseType = require('./getReleaseType')
const updateLabels = require('./updateLabels')
const updateStatus = require('./updateStatus')

const handlePullRequestChange = async function (context) {
  debug('Start')

  let { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  const message = extractConventionalCommitMessage(body)
  let releaseType = await getReleaseType(`${title}\n\n${message}`)

  debug('Release type:', releaseType)

  await updateStatus({ context, head, releaseType, title, message })
  await updateLabels({ context, number, releaseType })
}

module.exports = handlePullRequestChange
