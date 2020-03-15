'use strict'

const debug = require('debug')('app:checkForTrigger')
const getenv = require('getenv')

const getMergeComment = require('./getMergeComment')

const automergeBranches = getenv.array('AUTOMERGE_BRANCHES', 'string', [])

const checkForTrigger = async function (context) {
  debug('Start')

  const branchName = context.payload.pull_request.head.ref
  debug(`Branch name: ${branchName}`)

  if (!automergeBranches.includes(branchName) && !await getMergeComment(context)) {
    debug('Branch is not in auto-merge list and no merge commit found. Skip.')
    return false
  }

  return true
}

module.exports = checkForTrigger
