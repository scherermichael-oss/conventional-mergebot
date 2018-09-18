'use strict'

const debug = require('debug')('app:handlePullRequestChange')

const extractMessage = require('./extractMessage')
const getCommitType = require('./getCommitType')
const getReleaseType = require('./getReleaseType')
const updateLabels = require('./updateLabels')
const updateStatus = require('./updateStatus')

const handlePullRequestChange = async function (context) {
  debug('Start')

  let { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  const labels = await context.github.issues.getIssueLabels(context.repo({ number }))
  const message = extractMessage(title, body, labels)
  let releaseType = await getReleaseType(message.full)

  debug('Release type:', releaseType)

  await updateStatus({ context, head, releaseType, messageBody: message.body })
  const commitType = getCommitType(title, labels)
  await updateLabels({ context, number, releaseType, commitType })
}

module.exports = handlePullRequestChange
