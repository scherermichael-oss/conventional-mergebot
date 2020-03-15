'use strict'

const check = require('./lib/handlers/check')
const commitStatus = require('./lib/handlers/commitStatus')
const comment = require('./lib/handlers/comment')
const pullRequestChange = require('./lib/handlers/pullRequestChange')

const probotPlugin = (robot) => {
  robot.on([
    'pull_request.edited',
    'pull_request.opened',
    'pull_request.reopened'
  ], pullRequestChange)
  robot.on([
    'issue_comment.created'
  ], comment)
  robot.on([
    'check_run.completed',
    'check_suite.completed'
  ], check)
  robot.on([
    'status'
  ], commitStatus)
}

module.exports = probotPlugin
