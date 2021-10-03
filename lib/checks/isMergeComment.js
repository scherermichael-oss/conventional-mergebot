'use strict'

const debug = require('debug')('app:checks:isMergeComment')

const isMergeComment = function (comment) {
  debug('Start')
  return comment && comment.body && comment.body.toLowerCase().trim() === '/merge'
}

module.exports = isMergeComment
