'use strict'

const debug = require('debug')('app:merge')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')

const merge = async function (context) {
  debug('Start')

  const { title, head, body, number } = context.payload.pull_request

  // Check user permissions if merge is triggered by a comment
  if (context.payload.comment) {
    const level = await context.github.repos.getCollaboratorPermissionLevel(
      context.repo({ username: context.payload.comment.user.login })
    )
    if (!level || !level.data || !['admin', 'maintain', 'write'].includes(level.data.permission)) {
      debug(`User ${context.payload.comment.user.login} is not allowed to commit to the repository. Permission level: ${
        JSON.stringify(level) || 'not found'
      }`)
      // Add reaction
      await context.github.reactions.createForIssueComment(context.repo({
        comment_id: context.payload.comment.id,
        content: 'confused'
      }))
      // Add comment
      await context.github.issues.createComment(context.repo({
        body: [
          '⚠️ Not Allowed to Merge ⚠️',
          '',
          'Only users with admin or write permissions for the repository are allowed to merge the pull request.'
        ].join('\n'),
        issue_number: number
      }))
      return
    }
  }

  // Abort if pull request is not mergable
  if (!context.payload.pull_request.mergeable) {
    // Add reaction to comment
    if (context.payload.comment) {
      await context.github.reactions.createForIssueComment(context.repo({
        comment_id: context.payload.comment.id,
        content: 'confused'
      }))
    }
    // Add comment if merge is triggered by a comment
    if (context.payload.comment) {
      await context.github.issues.createComment(context.repo({
        body: [
          '⚠️ Unable to Merge Pull Request ⚠️',
          '',
          'This pull request is not in a mergeable state at the moment.'
        ].join('\n'),
        issue_number: number
      }))
    }
    return
  }

  const message = extractMessage(title, body)
  const releaseType = await getReleaseType(message.full)

  // Abort if title contains prefix 'wip:' (case insensitive)
  if (message.title.toLowerCase().startsWith('wip:')) {
    if (context.payload.comment) {
      // Add reaction to user comment
      await context.github.reactions.createForIssueComment(context.repo({
        comment_id: context.payload.comment.id,
        content: 'confused'
      }))
      // Add comment if merge is triggered by a comment
      await context.github.issues.createComment(context.repo({
        body: [
          '⚠️ Unable to Merge Work in Progress ⚠️',
          '',
          '"WIP:" must be removed from the title before it can be merged.'
        ].join('\n'),
        issue_number: number
      }))
    }
    return
  }

  // Add reaction to indicate progress
  let progressReaction
  if (context.payload.comment) {
    progressReaction = await context.github.reactions.createForIssueComment(context.repo({
      comment_id: context.payload.comment.id,
      content: 'rocket'
    }))
  }

  let successComment = releaseType ? [
    '🎉 Pull Request Merged 🎉',
    '',
    'This pull request has been merged with the following commit message:',
    '',
    '``````',
    message.full,
    '``````',
    '',
    `A **${releaseType}** release is triggered.`
  ] : [
    '🎉 Pull Request Merged 🎉',
    '',
    'No type of pull request detected. Therefore, no release is triggered.'
  ]
  successComment = successComment.join('\n')

  try {
    // Merge branch to master
    await context.github.pulls.merge(context.repo({
      merge_method: 'squash',
      pull_number: number,
      sha: head.sha,
      commit_message: message.body,
      commit_title: message.title
    }))
    // Success comment
    await context.github.issues.createComment(context.repo({
      body: successComment,
      issue_number: number
    }))
    // Delete branch
    await context.github.git.deleteRef(context.repo({
      ref: `heads/${head.ref}`
    }))
  } catch (ex) {
    debug('An error occurred while merging:', ex)

    let errorMessage
    try {
      errorMessage = JSON.parse(ex.message).message
    } catch (exJson) {
      errorMessage = ex.message
    }

    if (context.payload.comment) {
      // Remove progress reaction from comment
      await context.github.reactions.delete({
        reaction_id: progressReaction.data.id
      })
      // Add negative reaction
      await context.github.reactions.createForIssueComment(context.repo({
        comment_id: context.payload.comment.id,
        content: 'confused'
      }))
    }
    // Add comment
    await context.github.issues.createComment(context.repo({
      body: [
        '⚠️ Merging Pull Request Failed ⚠️',
        '',
        errorMessage
      ].join('\n'),
      issue_number: number
    }))
  }
}

module.exports = merge
