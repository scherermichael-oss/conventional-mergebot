'use strict'

const debug = require('debug')('app:updateReviewers')
const getenv = require('getenv')

const reviewUsers = getenv.array('REVIEW_USERS', 'string', []);
const reviewTeams = getenv.array('REVIEW_TEAMS', 'string', []);

const updateReviewers = async function ({ context, number, releaseType }) {
  debug('Start')

  if (reviewUsers.length === 0 && reviewTeams.length === 0) {
    return
  }

  const data = context.repo({
    number,
    reviewers: reviewUsers,
    team_reviewers: reviewTeams
  })

  if (releaseType) {
    await context.github.pullRequests.createReviewRequest(data)
  } else {
    await context.github.pullRequests.deleteReviewRequest(data)
  }
}

module.exports = updateReviewers
