'use strict'

const debug = require('debug')('app:pullRequestChange')

const merge = require('../../merge')
const updateLabels = require('./updateLabels')

const pullRequestChange = async function (context) {
  debug('Start')

  const { title, body, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  await updateLabels({ context, number, title, body })
  await merge(context)
}

module.exports = pullRequestChange
