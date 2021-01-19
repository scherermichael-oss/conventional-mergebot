'use strict'

const debug = require('debug')('app:checkRun')

const merge = require('../merge')

const checkRun = async function (context) {
  debug('Start')

  debug(`CONTEXT: ${JSON.stringify(context)}`)

  if (context.payload.check_run.conclusion !== 'success') {
    debug('check_run is not "success". Skip.')
    continue
  }

  for (const { number } of context.payload.check_run.pull_requests) {
    context.payload.pull_request = (await context.github.pulls.get(
      context.repo({ pull_number: number })
    )).data

    if (context.payload.pull_request.state !== 'open') {
      debug(`Pull request ${number} is not open. Skip.`)
      continue
    }

    await merge(context)
  }
}

module.exports = checkRun
