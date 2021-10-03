'use strict'

const debug = require('debug')('app:checks:isWip')

const isWip = function (context) {
  debug('Start')
  return context.payload.pull_request && context.payload.pull_request.title.toLowerCase().startsWith('wip:')
}

module.exports = isWip
