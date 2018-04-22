'use strict'

const debug = require('debug')('app:updateLabels')

const updateLabels = async function ({context, number, releaseType}) {
  const labels = {
    major: 'type/major',
    minor: 'type/minor',
    patch: 'type/patch'
  }
  const issueLabels = (await context.github.issues.getIssueLabels(
    context.repo({ number }))
  ).data.map(item => item.name)

  Object.keys(labels).forEach(type => {
    const name = labels[type]

    const target = context.repo({
      number,
      labels: [name],
      name
    })

    if (releaseType === type) {
      if (!issueLabels.includes(name)) {
        debug('Add label:', name)
        context.github.issues.addLabels(target)
      }
    } else {
      if (issueLabels.includes(name)) {
        debug('Remove label:', name)
        context.github.issues.removeLabel(target)
      }
    }
  })
}

module.exports = updateLabels
