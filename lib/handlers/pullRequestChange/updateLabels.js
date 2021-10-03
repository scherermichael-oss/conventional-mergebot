/* eslint-disable camelcase */
'use strict'

const debug = require('debug')('app:handlers:pullRequestChange:updateLabels')

const _ = require('lodash')
const getenv = require('getenv')

const buildCommitMessage = require('../../buildCommitMessage')
const getReleaseType = require('../../getReleaseType')
const isAutomergeBranch = require('../../checks/isAutomergeBranch')
const isDependabotAutomergeBranch = require('../../checks/isDependabotAutomergeBranch')
const isWip = require('../../checks/isWip')

const labelSuffixMajor = getenv('LABEL_SUFFIX_MAJOR', 'major')
const labelSuffixMinor = getenv('LABEL_SUFFIX_MINOR', 'minor')
const labelSuffixPatch = getenv('LABEL_SUFFIX_PATCH', 'patch')
const labelPrefix = getenv('LABEL_PREFIX', 'release/')
const automergeLabel = getenv('AUTOMERGE_LABEL', 'automatic-merge')
const wipLabel = getenv('WIP_LABEL', 'work-in-progress')

const releaseTypeLabels = {
  major: `${labelPrefix}${labelSuffixMajor}`,
  minor: `${labelPrefix}${labelSuffixMinor}`,
  patch: `${labelPrefix}${labelSuffixPatch}`
}

const updateLabels = async function ({ context, number, title, body }) {
  debug('Start')

  const newLabels = []
  const oldLabels = []

  const issueLabels = (await context.octokit.issues.listLabelsOnIssue(
    context.repo({ issue_number: number })
  )).data.map(item => item.name)

  // Collect existing labels
  for (const label of issueLabels) {
    if (label.startsWith(labelPrefix)) {
      oldLabels.push(label)
    }
    if (label === automergeLabel) {
      oldLabels.push(automergeLabel)
    }
    if (label === wipLabel) {
      oldLabels.push(wipLabel)
    }
  }

  if (isWip(context)) {
    debug('WIP branch detected.')
    newLabels.push(wipLabel)
  } else {
    const message = buildCommitMessage(title, body)
    const releaseType = await getReleaseType(message.full)

    debug('Release type:', releaseType)

    // Collect new labels for release type
    if (releaseTypeLabels[releaseType]) {
      newLabels.push(releaseTypeLabels[releaseType])
      // Add label with type of merge commit (chore, fix, feat) followed by a colon or opening bracket
      const regex = /^[a-zA-Z]+[:(]/
      if (title.match(regex)) {
        const labelSuffix = title.match(regex)[0].slice(0, -1) // Remove trailing ':' or '('
        newLabels.push(`${labelPrefix}${labelSuffix}`)
      } else {
        debug('Warning: No keyword for type of merge found in title.')
      }
    }
  }

  // Add label for auto-merge branches
  if (isAutomergeBranch(context) || isDependabotAutomergeBranch(context)) {
    newLabels.push(automergeLabel)
  }

  // Create not yet existing labels
  if (newLabels.length > 0) {
    debug(`Add labels: ${newLabels}`)
    try {
      await context.octokit.issues.addLabels(
        context.repo({
          issue_number: number,
          labels: _.difference(newLabels, oldLabels)
        })
      )
    } catch (err) {
      // Intentionally ignore errors
    }
  }

  // Remove no longer needed labels
  for (const name of _.difference(oldLabels, newLabels)) {
    debug(`Remove label: ${name}`)
    try {
      await context.octokit.issues.removeLabel(
        context.repo({
          issue_number: number,
          name
        })
      )
    } catch (err) {
      // Intentionally ignore errors
    }
  }
}

module.exports = updateLabels
