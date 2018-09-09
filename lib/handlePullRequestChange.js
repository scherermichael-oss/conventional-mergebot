'use strict'

const debug = require('debug')('app:handlePullRequestChange')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')
const updateLabels = require('./updateLabels')
const updateStatus = require('./updateStatus')

const handlePullRequestChange = async function (context) {
  debug('Start')

  let { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  const message = extractMessage(title, body)
  let releaseType = await getReleaseType(message.full)

  debug('Release type:', releaseType)

  await updateStatus({ context, head, releaseType, messageBody: message.body })
  await updateLabels({ context, number, releaseType })
}

module.exports = handlePullRequestChange
