'use strict'

const debug = require('debug')('app:extractSemanticCommitMessage')

const extractSemanticCommitMessage = function (body) {
  const markers = {
    start: '--- START DESCRIPTION ---',
    end: '--- END DESCRIPTION ---'
  }

  // Remove all from start of body to the start marker
  let bodyStartRemoved = new RegExp(`${markers.start}([^]*)`).exec(body)
  bodyStartRemoved = bodyStartRemoved ? bodyStartRemoved[1] : body

  // Remove all from the end marker to end of body
  let bodyEndRemoved = new RegExp(`([^]*)${markers.end}`).exec(bodyStartRemoved)
  bodyEndRemoved = bodyEndRemoved ? bodyEndRemoved[1] : bodyStartRemoved

  // Remove all leading and trailing whitespaces
  let bodyTrimmed = new RegExp(`^\\s*([^]*?)\\s*$`).exec(bodyEndRemoved)
  bodyTrimmed = bodyTrimmed ? bodyTrimmed[1] : bodyEndRemoved

  debug('Extracted commit message:', bodyTrimmed)

  return bodyTrimmed
}

module.exports = extractSemanticCommitMessage
