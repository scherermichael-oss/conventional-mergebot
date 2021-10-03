'use strict'

const debug = require('debug')('app:merge:index')

const buildCommitMessage = require('../buildCommitMessage')
const buildResultMessage = require('../buildResultMessage')
const isMergePermitted = require('../checks/isMergePermitted')
const isMergeTriggered = require('../checks/isMergeTriggered')
const isAutomergeBranch = require('../checks/isAutomergeBranch')
const isDependabotAutomergeBranch = require('../checks/isDependabotAutomergeBranch')
const isWip = require('../checks/isWip')
const requestReview = require('../requestReview')

const merge = async function (context) {
  debug('Start')

  debug('Check isWip')
  if (isWip(context)) {
    return
  }

  const { title, head, body, number, base } = context.payload.pull_request

  debug('Check isMergeTriggered')
  if (!(await isMergeTriggered(context))) {
    return
  }

  debug('Check isMergePermitted')
  if (!(await isMergePermitted(context))) {
    return
  }

  // Add reaction to merge comment to indicate progress
  if (context.payload.comment) {
    debug('Add rocket reaction')
    await context.octokit.reactions.createForIssueComment(
      context.repo({
        comment_id: context.payload.comment.id,
        content: 'rocket'
      })
    )
  }

  const commitMessage = buildCommitMessage(title, body)

  try {
    // Merge branch to master
    debug('Merge pr')
    await context.octokit.pulls.merge(
      context.repo({
        merge_method: 'squash',
        pull_number: number,
        sha: head.sha,
        commit_message: commitMessage.body,
        commit_title: commitMessage.title
      })
    )

    // Success comment
    debug('Add success comment')
    await context.octokit.issues.createComment(
      context.repo({
        body: await buildResultMessage({
          context,
          commitMessage,
          ref: base.ref
        }),
        issue_number: number
      })
    )

    // Delete branch
    debug('Delete branch')
    await context.octokit.git.deleteRef(
      context.repo({
        ref: `heads/${head.ref}`
      })
    )
  } catch (exception) {
    debug(`An error occurred while merging: ${exception.message}`)

    // Skip message if checks are simply still running
    if (
      exception.message &&
      exception.message.match(
        /required status (check .* is|checks are) (expected|queued|in progress)./i
      )
    ) {
      return
    }

    // Error comment
    debug('Add error comment')
    await context.octokit.issues.createComment(
      context.repo({
        body: await buildResultMessage({ context, exception }),
        issue_number: number
      })
    )

    if (isAutomergeBranch(context) || isDependabotAutomergeBranch(context)) {
      await requestReview(context)
    }
  }
}

module.exports = merge
