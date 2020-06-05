'use strict'

const isMergeComment = function(comment) {
  return comment && comment.body && comment.body.toLowerCase().trim() === '/merge'
}

module.exports = isMergeComment;