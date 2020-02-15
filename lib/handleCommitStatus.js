'use strict'

const debug = require('debug')('app:handleCommitStatus')

const areAllChecksSuccessful = require('./areAllChecksSuccessful')
const merge = require('./merge')

const handleCommitStatus = async function (context) {
  debug('Start')

  for (const branch of context.payload.branches) {
    debug(`Branch: ${branch.name}`)

    if (context.payload.state !== 'success') {
      debug('Status not "success". Skip.')
      continue
    }

    if (branch.commit.sha !== context.payload.commit.sha) {
      debug('Commit not head of branch. Skip.')
      continue
    }

    const options = context.repo({ head: `${context.repo().owner}:${branch.name}` })
    debug(`Context: ${JSON.stringify(options, null, 2)}`)
    const pullRequests = await context.github.paginate(
      context.github.pulls.list.endpoint.merge(
        options
      )
    )

    // debug(`PULLS: ${JSON.stringify(pullRequests, null, 2)}`)

    for (const { number } of pullRequests) {
      context.payload.pull_request = (await context.github.pulls.get(
        context.repo({ pull_number: number })
      )).data

      // debug(`PULL: ${JSON.stringify(context.payload.pull_request, null, 2)}`)

      if (context.payload.pull_request.state !== 'open') {
        return debug('Pull request is not open. Skip.')
      }

      if (await areAllChecksSuccessful(context)) {
        debug('All checks are successful. Merging.')
        await merge(context)
      } else {
        debug('Not all checks are successful. Skip merging.')
      }
    }
  }
}

module.exports = handleCommitStatus
