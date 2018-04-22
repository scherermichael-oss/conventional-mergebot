'use strict'

const debug = require('debug')('app:handlePullRequestChange')

const extractSemanticCommitMessage = require('./extractSemanticCommitMessage')
const getReleaseType = require('./getReleaseType')
const merge = require('./merge')
const updateLabels = require('./updateLabels')
const updateStatus = require('./updateStatus')

const handlePullRequestChange = async function (context) {
  let { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Abort.')
  }

  const message = extractSemanticCommitMessage(body)
  const releaseType = await getReleaseType(`${title}\n\n${message}`)

  debug('Release type:', releaseType)

  await updateStatus({ context, head, releaseType })
  await updateLabels({ context, number, releaseType })
  await merge({ context, title, message, head, number, releaseType })
}

module.exports = handlePullRequestChange
