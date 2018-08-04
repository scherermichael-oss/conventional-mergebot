'use strict'

const debug = require('debug')('app:extractConventionalCommitMessage')

const extractConventionalCommitMessage = function (body = '') {
  debug('Start')

  const markers = {
    start: '## Changelog',
    end: '#'
  }

  let message = new RegExp(`${markers.start}([^]*?)(${markers.end}|$)`).exec(body)
  message = message ? message[1] : ''

  // Remove all leading and trailing whitespaces
  message = new RegExp(`^\\s*([^]*?)\\s*$`).exec(message)
  message = message ? message[1] : message

  debug('Extracted commit message:', message)

  return message
}

module.exports = extractConventionalCommitMessage
