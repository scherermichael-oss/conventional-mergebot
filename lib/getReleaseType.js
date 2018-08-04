'use strict'

const debug = require('debug')('app:getReleaseType')

const commitAnalyzer = require('@semantic-release/commit-analyzer')

const getReleaseType = async function (message = '') {
  debug('Start')
  debug(`message: '${message}'`)

  if (!message.match(/^(feat|fix)(\(.*?\))?: /)) {
    debug('Message must start with \'feat: \' or \'fix: \'. Release type reset to null.')
    return null
  }

  const type = await commitAnalyzer({}, {
    commits: [{ message }],
    logger: console
  })

  debug(`Release type: ${type}`)

  return type
}

module.exports = getReleaseType
