'use strict'

const handleComment = require('./lib/handleComment')
const handlePullRequestChange = require('./lib/handlePullRequestChange')

const probotPlugin = (robot) => {
  robot.on([
    'pull_request.edited',
    'pull_request.opened',
    'pull_request.reopened'
  ], handlePullRequestChange)
  robot.on([
    'issue_comment.created'
  ], handleComment)
}

module.exports = probotPlugin
