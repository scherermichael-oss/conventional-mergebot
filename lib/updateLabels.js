/* eslint-disable camelcase */
'use strict'

const _ = require('lodash')
const debug = require('debug')('app:updateLabels')

const updateLabels = async function ({ context, number, releaseType, commitType, title, releaseTypeLabel, labelPrefix, automergeBranch, automergeLabel }) {
  debug('Start')

  const newLabels = []
  const oldLabels = []

  const issueLabels = (await context.github.issues.listLabelsOnIssue(
    context.repo({ issue_number: number })
  )).data.map(item => item.name)

  // Collect existing labels with prefix
  for (const label of issueLabels) {
    if (label.startsWith(labelPrefix)) {
      oldLabels.push(label)
    }
  }

  // Remove all release labels for WIP branches
  if (title.toLowerCase().startsWith('wip:')) {
    debug('WIP branch, detected. Remove release labels.')
    for (const name of oldLabels) {
      debug(`Remove label: ${name}`)
      await context.github.issues.removeLabel(
        context.repo({
          issue_number: number,
          name
        })
      )
    }
    return
  }

  // Collect new labels for release type
  if (releaseTypeLabel) {
    newLabels.push(releaseTypeLabel)
    // Add label with type of merge commit (chore, fix, feat) followed by a colon or opening bracket
    const regex = /^[a-zA-Z]+[:(]/
    if (title.match(regex)) {
      const labelSuffix = title.match(regex)[0].slice(0, -1) // Remove trailing ':' or '('
      newLabels.push(`${labelPrefix}${labelSuffix}`)
    } else {
      debug('Warning: Type label without a title prefix found.')
    }
  }

  // Add label for auto-merge branches
  const branchName = context.repo({ commit_sha: context.payload.pull_request.head.ref })
  debug(`Branch name: ${branchName}`)
  if (automergeBranch.includes(branchName)) {
    newLabels.push(automergeLabel)
  }

  // Create not yet existing labels
  if (newLabels.length > 0) {
    debug(`Add labels: ${newLabels}`)
    await context.github.issues.addLabels(
      context.repo({
        issue_number: number,
        labels: _.difference(newLabels, oldLabels)
      })
    )
  }

  // Remove no longer needed labels
  for (const name of _.difference(oldLabels, newLabels)) {
    debug(`Remove label: ${name}`)
    await context.github.issues.removeLabel(
      context.repo({
        issue_number: number,
        name
      })
    )
  }
}

module.exports = updateLabels
