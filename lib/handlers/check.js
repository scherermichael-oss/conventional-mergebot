'use strict'

const debug = require('debug')('app:check')

const merge = require('../merge')

const handleCheck = async function (context) {
  debug('Start')

  const payload = context.payload.check_run || context.payload.check_suite || {}
  const pullRequests = payload.pull_requests || []

  for (const { number } of pullRequests) {
    context.payload.pull_request = (await context.github.pulls.get(
      context.repo({ pull_number: number })
    )).data

    if (context.payload.pull_request.state !== 'open') {
      return debug('Pull request is not open. Skip.')
    }

    await merge(context)
  }
}

module.exports = handleCheck
