'use strict'

const debug = require('debug')('app:extractConventionalCommitMessage')

const extractConventionalCommitMessage = function (body = '') {
  debug('Start')

  let message = /(^#+|\n#+) +Changelog([^]*?)(^#+ |\n#+ |$)/.exec(body)
  message = message ? message[2] : ''

  // Remove all leading and trailing whitespaces
  message = new RegExp(`^\\s*([^]*?)\\s*$`).exec(message)
  message = message ? message[1] : message

  debug('Extracted commit message:', message)

  return message
}

module.exports = extractConventionalCommitMessage
