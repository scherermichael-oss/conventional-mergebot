'use strict'

const getFinalCommentMessage = require('./getFinalCommentMessage')

const debug = require('debug')('app:checkForWip')

const checkForWip = async function (context) {
  debug('Start')

  // Abort if title contains prefix 'wip:' (case insensitive)
  if (context.payload.pull_request.title.toLowerCase().startsWith('wip:')) {
    const message = await getFinalCommentMessage({
      context,
      exception: new Error('`WIP:` must be removed from the title before it can be merged.')
    })

    await context.github.issues.createComment(context.repo({
      body: message,
      issue_number: context.payload.pull_request.number
    }))

    return false
  }

  return true
}

module.exports = checkForWip
