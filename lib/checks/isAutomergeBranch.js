'use strict'

const debug = require('debug')('app:checks:isAutomergeBranch')
const getenv = require('getenv')

const automergeBranches = getenv.array('AUTOMERGE_BRANCHES', 'string', [])

const isAutomergeBranch = function (context) {
  debug('Start')

  const branchName = context.payload.pull_request.head.ref
  return automergeBranches.includes(branchName)
}

module.exports = isAutomergeBranch
