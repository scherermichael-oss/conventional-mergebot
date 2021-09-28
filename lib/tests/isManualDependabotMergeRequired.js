'use strict'

const getenv = require('getenv')
const semver = require('semver')

const automergeReleaseTypes = getenv.array(
  'AUTOMERGE_DEPENDABOT_UPDATE_TYPES',
  'string',
  []
)
const automergeModulePrefix = getenv('AUTOMERGE_DEPENDABOT_MODULE_PREFIX', '')

const isManualDependabotMergeRequired = function (context) {
  const branchName = context.payload.pull_request.head.ref

  if (!branchName.startsWith('dependabot/')) {
    // skip test if not from dependabot
    return false
  }

  const matches = context.payload.pull_request.title.match(
    /[Bb]ump ([^ ]+) from (\d+\.\d+\.\d+) to (\d+\.\d+\.\d+)(?:$| )/
  )

  if (!matches) {
    // unknown PR from dependabot, manual merge required
    return true
  }

  const name = matches[1]
  const from = matches[2]
  const to = matches[3]

  if (!name.startsWith(automergeModulePrefix)) {
    // PR for third party module, manual merge required
    return true
  }

  // PR for unsupported release types (e.g. major), manual merge required
  return !automergeReleaseTypes.includes(semver.diff(from, to))
}

module.exports = isManualDependabotMergeRequired
