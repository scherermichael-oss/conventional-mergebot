'use strict'

const debug = require('debug')('app:extractMessage')

const getCommitType = require('./getCommitType')

const extractMessage = function (title, description, labels) {
  debug('Start')

  const message = {
    title: '',
    body: '',
    full: ''
  }

  const type = getCommitType(title, labels)

  const titleParts = /^ *(feat|feature|fix) *(\(.*?\))? *: +(.*)$/i.exec(title)
  if (titleParts) {
    if (!titleParts[2]) {
      titleParts[2] = ''
    }
    message.title = `${type}${titleParts[2]}: ${titleParts[3].trim()}`
  }

  let details = /(?:^#+|\n#+) +Details?([^]*?)(\n#+ |$)/i.exec(description)
  let breaking = /(?:^#+|\n#+) +Breaking(?: Changes?)?([^]*?)(\n#+ |$)/i.exec(description)
  let references = /(?:^#+|\n#+) +Ref(?:erences?)?([^]*?)(\n#+ |$)/i.exec(description)

  details = details ? details[1].trim() : ''
  if (breaking) {
    // Add BREAKING CHANGES only if there is more text
    breaking = breaking[1].trim() === '' ? '' : `BREAKING CHANGES: ${breaking[1].trim()}`
  } else {
    breaking = ''
  }
  references = references ? references[1].trim() : ''

  const spacer = '\n\n'
  message.body = `${details}${spacer}${breaking}${spacer}${references}`.trim()
  message.full = `${message.title}${spacer}${message.body}`.trim()

  debug('Extracted commit message:', message)

  return message
}

module.exports = extractMessage
