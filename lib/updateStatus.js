'use strict'

const debug = require('debug')('app:updateStatus')

const updateStatus = async function ({ context, head, base, releaseType, messageBody = '' }) {
  debug('Start')

  try {
    await context.github.repos.createStatus(context.repo({
      context: 'Conventional Mergebot',
      description: (releaseType && base.ref === 'master')
        ? `'/merge' triggers a ${releaseType} release.`
        : '\'/merge\' will not trigger a release.',
      target_url: 'https://conventionalcommits.org',
      sha: head.sha,
      state: 'success'
    }))
  } catch (err) {
    // Intentionally ignore errors
  }
}

module.exports = updateStatus
