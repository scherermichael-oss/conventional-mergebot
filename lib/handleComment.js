'use strict'

const debug = require('debug')('app:handleComment')

const handlePullRequestChange = require('./handlePullRequestChange')

const handleComment = async function (context) {
  /* eslint-disable camelcase */
  const { number, pull_request } = context.payload.issue

  if (!pull_request) {
    return debug('Comment does not belong to a pull request. Abort.')
  }

  const target = context.repo({ number })

  context.payload.pull_request = (await context.github.pullRequests.get(target)).data
  handlePullRequestChange(context)
}

module.exports = handleComment
