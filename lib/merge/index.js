'use strict'

const debug = require('debug')('app:merge')

const buildCommitMessage = require('../buildCommitMessage')
const buildResultMessage = require('../buildResultMessage')
const isMergePermitted = require('../tests/isMergePermitted')
const isMergeTriggered = require('../tests/isMergeTriggered')
const isWip = require('../tests/isWip')

const merge = async function (context) {
  debug('Start')

  if (isWip(context)) {
    return
  }

  if (!await isMergeTriggered(context)) {
    return
  }

  if (!await isMergePermitted(context)) {
    return
  }

  // Add reaction to merge comment to indicate progress
  if (context.payload.comment) {
    await context.github.reactions.createForIssueComment(context.repo({
      comment_id: context.payload.comment.id,
      content: 'rocket'
    }))
  }

  const { title, head, body, number } = context.payload.pull_request
  const commitMessage = buildCommitMessage(title, body)

  try {
    // Merge branch to master
    await context.github.pulls.merge(context.repo({
      merge_method: 'squash',
      pull_number: number,
      sha: head.sha,
      commit_message: commitMessage.body,
      commit_title: commitMessage.title
    }))

    // Success comment
    await context.github.issues.createComment(context.repo({
      body: await buildResultMessage({ context, commitMessage }),
      issue_number: number
    }))

    // Delete branch
    await context.github.git.deleteRef(context.repo({
      ref: `heads/${head.ref}`
    }))
  } catch (exception) {
    debug(`An error occurred while merging: ${exception.message}`)

    // Skip message if checks are simply still running
    if (exception.message && exception.message.match(/required status (check .* is|checks are) pending./i)) {
      return
    }

    // Error comment
    await context.github.issues.createComment(context.repo({
      body: await buildResultMessage({ context, exception }),
      issue_number: number
    }))
  }
}

module.exports = merge
