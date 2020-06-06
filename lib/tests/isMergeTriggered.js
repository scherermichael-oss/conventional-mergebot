'use strict'

const debug = require('debug')('app:isMergeTriggered')

const getMergeComment = require('../merge/getMergeComment')
const isAutomergeBranch = require('./isAutomergeBranch')

const isMergeTriggered = async function (context) {
  debug('Start')

  const mergeComment = await getMergeComment(context)

  if (!isAutomergeBranch(context) && !mergeComment) {
    debug('Branch is not in auto-merge list and no merge commit found. Skip.')
    return false
  }

  // Set context's comment to last merge comment for later use
  context.payload.comment = mergeComment

  return true
}

module.exports = isMergeTriggered
