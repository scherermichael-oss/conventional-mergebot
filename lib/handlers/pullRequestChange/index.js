'use strict'

const debug = require('debug')('app:pullRequestChange')
const getenv = require('getenv')

const buildCommitMessage = require('../../buildCommitMessage')
const getReleaseType = require('../../getReleaseType')
const merge = require('../../merge')
const updateLabels = require('./updateLabels')

const labelSuffixMajor = getenv('LABEL_SUFFIX_MAJOR', 'major')
const labelSuffixMinor = getenv('LABEL_SUFFIX_MINOR', 'minor')
const labelSuffixPatch = getenv('LABEL_SUFFIX_PATCH', 'patch')
const labelPrefix = getenv('LABEL_PREFIX', 'release/')
const automergeBranches = getenv.array('AUTOMERGE_BRANCHES', 'string', [])
const automergeLabel = getenv('AUTOMERGE_LABEL', 'automatic-merge')
const wipLabel = getenv('WIP_LABEL', 'work-in-progress')

const releaseTypeLabels = {
  major: `${labelPrefix}${labelSuffixMajor}`,
  minor: `${labelPrefix}${labelSuffixMinor}`,
  patch: `${labelPrefix}${labelSuffixPatch}`
}

const pullRequestChange = async function (context) {
  debug('Start')

  const { title, body, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  const message = buildCommitMessage(title, body)
  const releaseType = await getReleaseType(message.full)

  debug('Release type:', releaseType)

  await updateLabels({ context, number, releaseType, title, releaseTypeLabel: releaseTypeLabels[releaseType], labelPrefix, automergeBranches, automergeLabel, wipLabel })
  await merge(context)
}

module.exports = pullRequestChange
