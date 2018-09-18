'use strict'

const debug = require('debug')('app:updateLabels')
const getenv = require('getenv')

const bugfixLabel = getenv('BUGFIX_LABEL', '')
const featureLabel = getenv('FEATURE_LABEL', '')

const majorReleaseLabel = getenv('MAJOR_RELEASE_LABEL', 'release/major')
const minorReleaseLabel = getenv('MINOR_RELEASE_LABEL', 'release/minor')
const patchReleaseLabel = getenv('PATCH_RELEASE_LABEL', 'release/patch')

const update = async function (context, number, issueLabels, myLabels, selectedType) {
  for (const type in myLabels) {
    debug('Checking %s', type)
    const name = myLabels[type]

    const target = context.repo({
      number,
      labels: [name],
      name
    })

    if (type === selectedType) {
      if (!issueLabels.includes(name)) {
        debug('Add label:', name)
        await context.github.issues.addLabels(target)
      }
    } else {
      if (issueLabels.includes(name)) {
        debug('Remove label:', name)
        await context.github.issues.removeLabel(target)
      }
    }
  }
}

const updateLabels = async function ({context, number, releaseType, commitType}) {
  debug('Start')

  const issueLabels = (await context.github.issues.getIssueLabels(
    context.repo({ number })
  )).data.map(item => item.name)

  const releaseTypeLabels = {
    major: majorReleaseLabel,
    minor: minorReleaseLabel,
    patch: patchReleaseLabel
  }

  await update(context, number, issueLabels, releaseTypeLabels, releaseType)

  // Set commit type label only if both are defined
  if (bugfixLabel === '' || featureLabel === '') {
    return
  }

  const commitTypeLabels = {
    fix: bugfixLabel,
    feat: featureLabel
  }

  await update(context, number, issueLabels, commitTypeLabels, commitType)
}

module.exports = updateLabels
