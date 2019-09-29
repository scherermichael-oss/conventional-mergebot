'use strict'

const debug = require('debug')('app:merge')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')

const merge = async function ({ context }) {
  debug('Start')

  const { title, head, body, number } = context.payload.pull_request

  // Check user permissions
  const level = await context.github.repos.getCollaboratorPermissionLevel(
    context.repo({ username: context.payload.comment.user.login })
  )
  if (!level || !['admin', 'write'].includes(level.permission)) {
    debug(`User ${context.payload.comment.user.login} is not allowed to commit to the repository.`)
    await context.github.issues.createComment(context.repo({
      body: [
        '✘ Not Allowed to Merge ✘',
        '',
        'Only users with admin or write permissions for the repository are allowed to merge the pull request.'
      ].join('\n'),
      issue_number: number
    }))
    return
  }

  const message = extractMessage(title, body)
  const releaseType = await getReleaseType(message.full)

  // Abort if title contains prefix 'wip:' (case insensitive)
  if (message.title.toLowerCase().startsWith('wip:')) {
    await context.github.issues.createComment(context.repo({
      body: [
        '✘ Unable to Merge Work in Progress ✘',
        '',
        '"WIP:" must be removed from the title before it can be merged.'
      ].join('\n'),
      issue_number: number
    }))
    return
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

    const errorMessage = JSON.parse(ex.message).message
    await context.github.issues.createComment(context.repo({
      body: [
        '✘ Merging Pull Request Failed ✘',
        '',
        errorMessage
      ].join('\n'),
      issue_number: number
    }))
  }
}

module.exports = merge
