'use strict'

const debug = require('debug')('app:updateStatus')
const getenv = require('getenv')

const updateStatus = async function ({ context, head, releaseType, messageBody = '' }) {
  debug('Start')

  // Manual merge allowed: Always success
  // No manual merge allowed: type found = pending, no type found = error
  const allowManualMerge = getenv.boolish('ALLOW_MANUAL_MERGE', true)
  const successState = allowManualMerge ? 'success' : 'pending'
  const state = (releaseType || allowManualMerge) ? successState : 'error'

  debug(`New state: ${state} (${releaseType})`)

  context.github.repos.createStatus(context.repo({
    context: 'Conventional Mergebot',
    description: releaseType
      ? `'/merge' triggers a ${releaseType} release.${messageBody === '' ? ' Title only!' : ''}`
      : 'No conventional commit message found.',
    target_url: 'https://conventionalcommits.org',
    sha: head.sha,
    state
  }))
}

module.exports = updateStatus
