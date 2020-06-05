'use strict'

const debug = require('debug')('app:comment')

const isMergeComment = require('../isMergeComment')
const merge = require('../merge')

const comment = async function (context) {
  debug('Start')

  if (!isMergeComment(context.payload.comment)) {
    return debug('Comment is no merge command. Skip.')
  }

  const { number, pull_request: pullRequest } = context.payload.issue

  if (!pullRequest) {
    return debug('Comment does not belong to a pull request. Skip.')
  }

  context.payload.pull_request = (await context.github.pulls.get(
    context.repo({ pull_number: number })
  )).data

  if (context.payload.pull_request.state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  await merge(context)
}

module.exports = comment
