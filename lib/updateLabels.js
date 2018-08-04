'use strict'

const debug = require('debug')('app:updateLabels')

const updateLabels = async function ({context, number, releaseType}) {
  debug('Start')

  const labels = {
    major: 'release/major',
    minor: 'release/minor',
    patch: 'release/patch'
  }
  const issueLabels = (await context.github.issues.getIssueLabels(
    context.repo({ number }))
  ).data.map(item => item.name)

  for (const type in labels) {
    debug('Checking %s', type)
    const name = labels[type]

    const target = context.repo({
      number,
      labels: [name],
      name
    })

    if (releaseType === type) {
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

module.exports = updateLabels
