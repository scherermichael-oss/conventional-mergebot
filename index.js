'use strict'

const handleCheck = require('./lib/handleCheck')
const handleComment = require('./lib/handleComment')
const handlePullRequestChange = require('./lib/handlePullRequestChange')

const probotPlugin = (robot) => {
  robot.on([
    'pull_request.edited',
    'pull_request.labeled',
    'pull_request.unlabeled',
    'pull_request.opened',
    'pull_request.reopened'
  ], handlePullRequestChange)
  robot.on([
    'issue_comment.created'
  ], handleComment)
  robot.on([
    'check_run.completed',
    'check_suite.completed'
  ], handleCheck)
}

module.exports = probotPlugin
