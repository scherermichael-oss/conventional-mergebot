'use strict'

const debug = require('debug')('app:handleComment')

const merge = require('./merge')

const handleComment = async function (context) {
  debug('Start')

  if (context.payload.comment.body.trim() !== '/merge') {
    return debug('Comment is no \'/merge\' command. Skip.')
  }

  const { number, pull_request: pullRequest } = context.payload.issue

  if (!pullRequest) {
    return debug('Comment does not belong to a pull request. Skip.')
  }

  const target = context.repo({ number })

  context.payload.pull_request = (await context.github.pullRequests.get(target)).data

  if (context.payload.pull_request.state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  await merge({ context })
}

module.exports = handleComment
