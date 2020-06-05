'use strict'

const isWip = function (context) {
  return context.payload.pull_request && context.payload.pull_request.title.toLowerCase().startsWith('wip:')
}

module.exports = isWip
