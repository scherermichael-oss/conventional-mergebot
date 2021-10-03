'use strict'

const debug = require('debug')('app:handlers:status')

const isAutomergeBranch = require('../checks/isAutomergeBranch')
const isDependabotAutomergeBranch = require('../checks/isDependabotAutomergeBranch')
const merge = require('../merge')
const requestReview = require('../requestReview')

const status = async function (context) {
  debug('Start')

  for (const branch of context.payload.branches) {
    debug(`Branch: ${branch.name}`)

    if (branch.commit.sha !== context.payload.commit.sha) {
      debug('Commit not head of branch. Skip.')
      continue
    }

    const pullRequests = await context.octokit.paginate(
      context.octokit.pulls.list.endpoint.merge(
        context.repo({ head: `${context.repo().owner}:${branch.name}` })
      )
    )

    for (const { number } of pullRequests) {
      context.payload.pull_request = (await context.octokit.pulls.get(
        context.repo({ pull_number: number })
      )).data

      if (context.payload.pull_request.state !== 'open') {
        debug(`Pull request ${number} is not open. Skip.`)
        continue
      }

      if (context.payload.state !== 'success') {
        debug('Status is not "success". Check for automerge pr.')
        if (isAutomergeBranch(context) || isDependabotAutomergeBranch(context)) {
          debug('Add review request.')
          await requestReview(context)
        }

        debug('Status not "success". Skip.')
        continue
      }

      await merge(context)
    }
  }
}

module.exports = status
