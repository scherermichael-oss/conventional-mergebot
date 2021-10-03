'use strict'

const debug = require('debug')('app:checks:isPrOpen')

const isPrOpen = function (context) {
  debug('Start')
  return context.payload.pull_request && context.payload.pull_request.state === 'open'
}

module.exports = isPrOpen
