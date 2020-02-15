'use strict'

const debug = require('debug')('app:handlePullRequestChange')
const getenv = require('getenv')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')
const updateLabels = require('./updateLabels')
const updateReviewers = require('./updateReviewers')
const updateStatus = require('./updateStatus')

const reviewUsersRules = getenv('REVIEW_USERS_RULES', '')
const reviewTeamsRules = getenv('REVIEW_TEAMS_RULES', '')
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

const handlePullRequestChange = async function (context) {
  debug('Start')

  const { title, body, head, number, state } = context.payload.pull_request

  if (state !== 'open') {
    return debug('Pull request is not open. Skip.')
  }

  const message = extractMessage(title, body)
  const releaseType = await getReleaseType(message.full)

  debug('Release type:', releaseType)

  await updateStatus({ context, head, releaseType, messageBody: message.body })
  await updateLabels({ context, number, releaseType, title, releaseTypeLabel: releaseTypeLabels[releaseType], labelPrefix, automergeBranches, automergeLabel, wipLabel })
  await updateReviewers({ context, number, releaseType, reviewUsersRules, reviewTeamsRules })
}

module.exports = handlePullRequestChange
