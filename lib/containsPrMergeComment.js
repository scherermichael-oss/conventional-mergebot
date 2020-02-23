'use strict'

// See: https://dev.to/gr2m/github-api-how-to-retrieve-the-combined-pull-request-status-from-commit-statuses-check-runs-and-github-action-results-2cen

const debug = require('debug')('app:containsPrMergeComment')

const containsPrMergeComment = async function (context) {
  debug('Start')

  const issueContext = context.repo({ issue_number: context.payload.pull_request.head.number })
  debug(`Context: ${JSON.stringify(issueContext)}`)

  const comments = await context.github.paginate(
    context.github.issues.listComments.endpoint.merge(issueContext)
  )
  debug(`Comments: ${JSON.stringify(comments)}`)

  // Check from newest to oldest comment
  comments.reverse()

  for (const comment of comments) {
    if (comment.body.toLowerCase().trim() === '/merge') {
      // Comment is needed in context to check permissions when merging
      context.payload.comment = comment
      return true
    }
  }

  return false
}

module.exports = containsPrMergeComment
