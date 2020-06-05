'use strict'

const debug = require('debug')('app:merge')

const checkForPermissions = require('./checkForPermissions')
const checkForTrigger = require('./checkForTrigger')
const checkForWip = require('./checkForWip')
const extractMessage = require('../extractMessage')
const getFinalCommentMessage = require('./getFinalCommentMessage')
const isMergeComment = require('../isMergeComment')

const merge = async function (context) {
  debug('Start')

  if (!await checkForTrigger(context)) {
    return
  }

  if (!await checkForPermissions(context)) {
    return
  }

  // Add reaction to merge comment to indicate progress
  if (isMergeComment(context.payload.comment)) {
    await context.github.reactions.createForIssueComment(context.repo({
      comment_id: context.payload.comment.id,
      content: 'rocket'
    }))
  }

  if (!await checkForWip(context)) {
    return
  }

  const { title, head, body, number } = context.payload.pull_request
  const commitMessage = extractMessage(title, body)

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
      body: await getFinalCommentMessage({ context, commitMessage }),
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
      body: await getFinalCommentMessage({ context, exception }),
      issue_number: number
    }))
  }
}

module.exports = merge
