'use strict'

const debug = require('debug')('app:handlers:comment')

const buildResultMessage = require('../buildResultMessage')
const isMergeComment = require('../checks/isMergeComment')
const isPrOpen = require('../checks/isPrOpen')
const isWip = require('../checks/isWip')
const merge = require('../merge')

const createErrorComment = async function (context, message) {
  const body = await buildResultMessage({
    context,
    exception: new Error(message)
  })

  await context.octokit.issues.createComment(context.repo({
    body,
    issue_number: context.payload.pull_request.number
  }))
}

const comment = async function (context) {
  debug('Start')

  if (!isMergeComment(context.payload.comment)) {
    return debug('Comment is no merge command. Skip.')
  }

  const { number, pull_request: pullRequest } = context.payload.issue

  if (!pullRequest) {
    return debug('Comment does not belong to a pull request. Skip.')
  }

  context.payload.pull_request = (await context.octokit.pulls.get(
    context.repo({ pull_number: number })
  )).data

  if (!isPrOpen(context)) {
    debug('Pull request is not open. Skip.')
    return await createErrorComment(context, 'Pull request is not open.')
  }

  if (isWip(context)) {
    debug('WIP keyword found. Skip.')
    return await createErrorComment(context, 'Please remove `WIP:` from the title to merge this pull request.')
  }

  await merge(context)
}

module.exports = comment
