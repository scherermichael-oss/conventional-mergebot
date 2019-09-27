'use strict'

const _ = require('lodash')
const debug = require('debug')('app:updateReviewers')
const getenv = require('getenv')

const reviewUsersRules = getenv('REVIEW_USERS_RULES', '')
const reviewTeamsRules = getenv('REVIEW_TEAMS_RULES', '')

const evaluateRules = function (rules, labelsAndTopics, reviewersToAdd, reviewersToDelete) {
  for (const rule of rules.split(' ')) {
    const [condition, action] = rule.split('=')

    if (_.difference(condition.split(','), labelsAndTopics).length === 0) {
      // condition is met by the given labels and topics
      for (const reviewer of action.split(',')) {
        if (reviewer.startsWith('-')) {
          // Remove first char and mark for deletion
          reviewersToDelete.push(reviewer.splice(1))
        } else if (reviewer.startsWith('+')) {
          // Remove first char and mark for addition
          reviewersToAdd.push(reviewer.splice(1))
        } else {
          // Mark for addition as it is
          reviewersToAdd.push(reviewer)
        }
      }
      // Stop after first match
      break
    }
  }
}

const updateReviewers = async function ({ context, number }) {
  debug('Start')

  if (reviewUsersRules === '' && reviewTeamsRules === '') {
    return
  }

  const labelsAndTopics = []
  const reviewUsersToAdd = []
  const reviewUsersToDelete = []
  const reviewTeamsToAdd = []
  const reviewTeamsToDelete = []

  labelsAndTopics.push(await context.github.repos.listTopics(context.repo()))
  labelsAndTopics.push(await context.github.repos.listLabelsOnIssue(context.repo({ number })))

  evaluateRules(reviewUsersRules, labelsAndTopics, reviewUsersToAdd, reviewUsersToDelete)
  evaluateRules(reviewTeamsRules, labelsAndTopics, reviewTeamsToAdd, reviewTeamsToDelete)

  await context.github.pullRequests.createReviewRequest(
    context.repo({
      number,
      reviewers: reviewUsersToAdd,
      team_reviewers: reviewTeamsToAdd
    })
  )
  await context.github.pullRequests.deleteReviewRequest(
    context.repo({
      number,
      reviewers: reviewUsersToAdd,
      team_reviewers: reviewTeamsToAdd
    })
  )
}

module.exports = updateReviewers
