/* eslint-disable camelcase */
'use strict'

const _ = require('lodash')
const debug = require('debug')('app:updateLabels')
const getenv = require('getenv')

const labelSuffixMajor = getenv('LABEL_SUFFIX_MAJOR', 'major')
const labelSuffixMinor = getenv('LABEL_SUFFIX_MINOR', 'minor')
const labelSuffixPatch = getenv('LABEL_SUFFIX_PATCH', 'patch')
const labelPrefix = getenv('LABEL_PREFIX', 'release/')

const releaseTypeLabels = {
  major: `${labelPrefix}${labelSuffixMajor}`,
  minor: `${labelPrefix}${labelSuffixMinor}`,
  patch: `${labelPrefix}${labelSuffixPatch}`
}

const updateLabels = async function ({ context, issue_number, releaseType, commitType, title }) {
  debug('Start')

  const newLabels = []
  const oldLabels = []

  const issueLabels = (await context.github.issues.getIssueLabels(
    context.repo({ issue_number })
  )).data.map(item => item.name)

  // Collect existing labels with prefix
  for (const label of issueLabels) {
    if (label.startsWith(labelPrefix)) {
      oldLabels.push(label)
    }
  }

  // Collect new labels
  if (releaseTypeLabels[releaseType]) {
    newLabels.push(releaseTypeLabels[releaseType])
    // Add label with type of merge commit (chore, fix, feat)
    newLabels.push(`${labelPrefix}${title.match(/^[a-zA-Z]+/)[0]}`)
  }

  // Create not yet existing labels
  if (newLabels.length > 0) {
    debug(`Add labels: ${newLabels}`)
    await context.github.issues.addLabels(
      context.repo({
        issue_number,
        labels: _.difference(newLabels, oldLabels)
      })
    )
  }

  // Remove no longer needed labels
  for (const name of _.difference(oldLabels, newLabels)) {
    debug(`Remove label: ${name}`)
    await context.github.issues.removeLabel(
      context.repo({
        issue_number,
        name
      })
    )
  }
}

module.exports = updateLabels
