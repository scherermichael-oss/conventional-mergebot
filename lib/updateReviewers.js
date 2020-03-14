'use strict'

const _ = require('lodash')
const debug = require('debug')('app:updateReviewers')

const evaluateRules = function (rules, labelsAndTopics, reviewersToAdd, reviewersToDelete) {
  debug(`rules: ${rules}`)
  for (const rule of rules.split(' ')) {
    debug(`rule: ${rule}`)
    const [condition, action] = rule.split('=')
    debug(`condition: ${condition}`)
    debug(`action: ${action}`)

    if (_.difference(condition.split(','), labelsAndTopics).length === 0) {
      debug('condition met')
      // condition is met by the given labels and topics
      for (const reviewer of action.split(',')) {
        debug(`reviewer: ${reviewer}`)
        if (reviewer.startsWith('-')) {
          debug(`delete: ${reviewer.slice(1)}`)
          // Remove first char and mark for deletion
          reviewersToDelete.push(reviewer.slice(1))
        } else if (reviewer.startsWith('+')) {
          debug(`add: ${reviewer.slice(1)}`)
          // Remove first char and mark for addition
          reviewersToAdd.push(reviewer.slice(1))
        } else {
          debug(`add: ${reviewer}`)
          // Mark for addition as it is
          reviewersToAdd.push(reviewer)
        }
      }
      // Stop after first match
      break
    }
  }
}

const updateReviewers = async function ({ context, number, reviewUsersRules, reviewTeamsRules }) {
  debug('Start')

  if (reviewUsersRules === '' && reviewTeamsRules === '') {
    debug('No rules given. Skip.')
    return
  }

  const labelsAndTopics = []
  const reviewUsersToAdd = []
  const reviewUsersToDelete = []
  const reviewTeamsToAdd = []
  const reviewTeamsToDelete = []

  const topics = await context.github.repos.listTopics(
    context.repo({
      headers: {
        accept: 'application/vnd.github.mercy-preview+json'
      }
    })
  )
  debug('Topics:', topics)
  labelsAndTopics.push(...topics.data.names)

  const labels = (await context.github.issues.listLabelsOnIssue(
    context.repo({ issue_number: number })
  )).data.map(item => item.name)
  debug('Labels:', labels)
  labelsAndTopics.push(...labels)

  evaluateRules(reviewUsersRules, labelsAndTopics, reviewUsersToAdd, reviewUsersToDelete)
  evaluateRules(reviewTeamsRules, labelsAndTopics, reviewTeamsToAdd, reviewTeamsToDelete)

  if (reviewUsersToAdd.length > 0 || reviewTeamsToAdd.length > 0) {
    debug('Users to add:', reviewUsersToAdd)
    debug('Teams to add:', reviewTeamsToAdd)
    try {
      await context.github.pulls.createReviewRequest(
        context.repo({
          pull_number: number,
          reviewers: reviewUsersToAdd,
          team_reviewers: reviewTeamsToAdd
        })
      )
    } catch (err) {
      // Intentionally ignore errors
    }
  }

  if (reviewUsersToDelete.length > 0 || reviewTeamsToDelete.length > 0) {
    debug('Users to remove:', reviewUsersToDelete)
    debug('Teams to remove:', reviewTeamsToDelete)
    try {
      await context.github.pulls.deleteReviewRequest(
        context.repo({
          pull_number: number,
          reviewers: reviewUsersToDelete,
          team_reviewers: reviewTeamsToDelete
        })
      )
    } catch (err) {
      // Intentionally ignore errors
    }
  }
}

module.exports = updateReviewers
