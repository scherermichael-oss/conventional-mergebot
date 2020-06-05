'use strict'

const debug = require('debug')('app:status')

const merge = require('../merge')

const status = async function (context) {
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

    const pullRequests = await context.github.paginate(
      context.github.pulls.list.endpoint.merge(
        {
          head: `${context.repo().owner}:${branch.name}`
        }
      )
    )

    for (const { number } of pullRequests) {
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
}

module.exports = status
