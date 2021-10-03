'use strict'

// See: https://dev.to/gr2m/github-api-how-to-retrieve-the-combined-pull-request-status-from-commit-statuses-check-runs-and-github-action-results-2cen

const debug = require('debug')('app:merge:getMergeComment')

const isMergeComment = require('../checks/isMergeComment')

const getMergeComment = async function (context) {
  debug('Start')

  const issueContext = context.repo({ issue_number: context.payload.pull_request.number })
  debug(`Context: ${JSON.stringify(issueContext)}`)

  const comments = await context.octokit.paginate(
    context.octokit.issues.listComments.endpoint.merge(issueContext)
  )
  debug(`Comments: ${JSON.stringify(comments)}`)

  // Check from newest to oldest comment
  comments.reverse()

  for (const comment of comments) {
    if (isMergeComment(comment)) {
      return comment
    }
  }

  // No merge comment found
  return null
}

module.exports = getMergeComment
