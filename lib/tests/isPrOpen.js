'use strict'

const isPrOpen = function (context) {
  return context.payload.pull_request && context.payload.pull_request.state === 'open'
}

module.exports = isPrOpen
