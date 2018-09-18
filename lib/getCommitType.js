'use strict'

const debug = require('debug')('app:getCommitType')
const getenv = require('getenv')

const bugfixLabel = getenv('BUGFIX_LABEL', '')
const featureLabel = getenv('FEATURE_LABEL', '')

const getCommitType = function (title, labels) {
  debug('Start')

  let type = ''

  // Create an invalid type by concatinating if they both are given
  type = labels.includes(bugfixLabel) ? 'fix' : ''
  type = labels.includes(featureLabel) ? `${type}feat` : type

  const titleParts = /^ *(feat|feature|fix)\b/i.exec(title)
  if (titleParts) {
    type = titleParts[1].toLowerCase()
    if (type === 'feature') {
      type = 'feat'
    }
  }

  debug(`Type: ${type}`)

  return type
}

module.exports = getCommitType
