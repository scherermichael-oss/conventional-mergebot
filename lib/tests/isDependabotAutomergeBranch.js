'use strict'

const getenv = require('getenv')
const semver = require('semver')

const automergeReleaseTypes = getenv.array(
  'AUTOMERGE_DEPENDABOT_UPDATE_TYPES',
  'string',
  ['minor', 'preminor', 'patch', 'prepatch', 'prerelease']
)

const isDependabotAutomergeBranch = function (context) {
  const branchName = context.payload.pull_request.head.ref

  if (!branchName.startsWith('dependabot/')) {
    return false
  }

  const matches = context.payload.pull_request.title.match(/from (\d\.\d\.\d) to (\d\.\d\.\d) /)

  if (!matches) {
    return false
  }

  const from = matches[1]
  const to = matches[2]

  return automergeReleaseTypes.includes(semver.diff(from, to))
}

module.exports = isDependabotAutomergeBranch
