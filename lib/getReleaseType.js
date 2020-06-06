'use strict'

const debug = require('debug')('app:getReleaseType')

const commitAnalyzer = require('@semantic-release/commit-analyzer')

const config = require('./config')

const getReleaseType = async function (message = '') {
  debug('Start')
  debug(`message: '${message}'`)

  if (message === '') {
    debug('Commit message is empty. Release type reset to null.')
    return null
  }

  const type = await commitAnalyzer.analyzeCommits(config, {
    commits: [{ message }],
    logger: console
  })

  debug(`Release type: ${type}`)

  return type
}

module.exports = getReleaseType
