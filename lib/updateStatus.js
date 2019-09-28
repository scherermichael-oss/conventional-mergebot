'use strict'

const debug = require('debug')('app:updateStatus')

const updateStatus = async function ({ context, head, releaseType, messageBody = '' }) {
  debug('Start')

  await context.github.repos.createStatus(context.repo({
    context: 'Conventional Mergebot',
    description: releaseType
      ? `'/merge' triggers a ${releaseType} release.`
      : `'/merge' will not trigger a release.`,
    target_url: 'https://conventionalcommits.org',
    sha: head.sha,
    state: 'success'
  }))
}

module.exports = updateStatus
