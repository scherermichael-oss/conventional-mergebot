'use strict'

const debug = require('debug')('app:updateLabels')
const getenv = require('getenv')

const labelMajor = getenv('LABEL_MAJOR', 'release/major')
const labelMinor = getenv('LABEL_MINOR', 'release/minor')
const labelPatch = getenv('LABEL_PATCH', 'release/patch')

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
    major: labelMajor,
    minor: labelMinor,
    patch: labelPatch
  }

  await update(context, number, issueLabels, releaseTypeLabels, releaseType)
}

module.exports = updateLabels
