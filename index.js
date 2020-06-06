'use strict'

const status = require('./lib/handlers/status')
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
    'status'
  ], status)
}

module.exports = probotPlugin
