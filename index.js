'use strict'

const handleComment = require('./lib/handleComment')
const handlePullRequestChange = require('./lib/handlePullRequestChange')

const probotPlugin = (robot) => {
  robot.on([
    'pull_request.edited',
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.synchronize',
    'pull_request_review.submitted'
  ], handlePullRequestChange)
  robot.on([
    'issue_comment'
  ], handleComment)
}

module.exports = probotPlugin
