'use strict'

const debug = require('debug')('app:handlers:checkSuite')

const isAutomergeBranch = require('../checks/isAutomergeBranch')
const isDependabotAutomergeBranch = require('../checks/isDependabotAutomergeBranch')
const merge = require('../merge')
const requestReview = require('../requestReview')

const checkSuite = async function (context) {
  debug('Start')

  for (const { number } of context.payload.check_suite.pull_requests) {
    context.payload.pull_request = (await context.octokit.pulls.get(
      context.repo({ pull_number: number })
    )).data

    if (context.payload.pull_request.state !== 'open') {
      debug(`Pull request ${number} is not open. Skip merge.`)
      continue
    }

    if (context.payload.check_suite.conclusion !== 'success') {
      debug('check_suite is not "success". Check for automerge pr.')
      if (isAutomergeBranch(context) || isDependabotAutomergeBranch(context)) {
        debug('Add review request.')
        await requestReview(context)
      }

      debug('check_suite is not "success". Skip merge.')
      continue
    }

    await merge(context)
  }
}

module.exports = checkSuite
