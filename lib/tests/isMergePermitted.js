'use strict'

const debug = require('debug')('app:isMergePermitted')

const isMergePermitted = async function (context) {
  debug('Start')

  // Check user permissions only if merge is triggered by a comment
  if (!context.payload.comment) {
    debug('No comment found. Skip checking permissions.')
    return true
  }

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
        'Only users with write permissions for the repository are allowed to merge the pull request.'
      ].join('\n'),
      issue_number: context.payload.pull_request.number
    }))

    return false
  }

  return true
}

module.exports = isMergePermitted
