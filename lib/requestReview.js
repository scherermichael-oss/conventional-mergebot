'use strict'

const debug = require('debug')('app:requestReview')

const requestReview = async function (context, action) {
  debug('Start')
  await context.octokit.pulls.requestReviewers(
    context.repo({
      pull_number: context.payload.pull_request.number,
      team_reviewers: ['com-infrastructure']
    })
  )
}

module.exports = requestReview