'use strict'

const debug = require('debug')('app:updateStatus')

const updateStatus = async function ({ context, head, releaseType, message = '' }) {
  debug('Start')

  // Do not prevent manual merging
  const state = releaseType ? 'success' : 'success'

  debug(`New state: ${state} (${releaseType})`)

  context.github.repos.createStatus(context.repo({
    context: 'Conventional Mergebot',
    description: releaseType
      ? `'/merge' will create a ${releaseType} release. ${message === '' ? ' Title only!' : ''}`
      : 'No conventional commit message found.',
    target_url: 'https://conventionalcommits.org',
    sha: head.sha,
    state
  }))
}

module.exports = updateStatus
