'use strict'

const commitAnalyzer = require('@semantic-release/commit-analyzer')

const getReleaseType = async function (message) {
  return commitAnalyzer({ releaseRules: null }, {
    commits: [{ message }],
    logger: console
  })
}

module.exports = getReleaseType
