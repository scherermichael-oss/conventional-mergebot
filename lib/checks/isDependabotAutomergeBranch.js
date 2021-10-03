'use strict'

const debug = require('debug')('app:checks:isDependabotAutomergeBranch')
const getenv = require('getenv')
const semver = require('semver')

const automergeReleaseTypes = getenv.array('AUTOMERGE_DEPENDABOT_UPDATE_TYPES', 'string', [])
const automergeModulePrefix = getenv('AUTOMERGE_DEPENDABOT_MODULE_PREFIX', '')

const isDependabotAutomergeBranch = function (context) {
  debug('Start')

  const branchName = context.payload.pull_request.head.ref

  if (!branchName.startsWith('dependabot/')) {
    return false
  }

  const matches = context.payload.pull_request.title.match(/[Bb]ump ([^ ]+) from (\d+\.\d+\.\d+) to (\d+\.\d+\.\d+)(?:$| )/)

  if (!matches) {
    return false
  }

  const name = matches[1]
  const from = matches[2]
  const to = matches[3]

  if (!name.startsWith(automergeModulePrefix)) {
    return false
  }

  return automergeReleaseTypes.includes(semver.diff(from, to))
}

module.exports = isDependabotAutomergeBranch
