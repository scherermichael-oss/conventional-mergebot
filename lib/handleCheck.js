'use strict'

const debug = require('debug')('app:handleCheck')
const getenv = require('getenv')

const areAllChecksSuccessful = require('./areAllChecksSuccessful')
const merge = require('./merge')

const automergeBranches = getenv.array('AUTOMERGE_BRANCHES', 'string', [])

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

    const branchName = context.payload.pull_request.head.ref
    debug(`Branch name: ${branchName}`)
    if (!automergeBranches.includes(branchName)) {
      return debug('Branch is not in auto-merge list. Skip.')
    }

    if (await areAllChecksSuccessful(context)) {
      debug('All checks are successful. Merging.')
      await merge(context)
    } else {
      debug('Not all checks are successful. Skip merging.')
    }
  }
}

module.exports = handleCheck
