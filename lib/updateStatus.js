'use strict'

const debug = require('debug')('app:updateStatus')

const updateStatus = async function ({ context, head, releaseType }) {
  const state = releaseType ? 'success' : 'error'

  debug(`New state: ${state} (${releaseType})`)

  context.github.repos.createStatus(context.repo({
    context: 'Conventional Mergebot',
    description: releaseType
      ? `valid ${releaseType} release commit message`
      : 'missing conventional commit message',
    target_url: 'https://conventionalcommits.org',
    sha: head.sha,
    state
  }))
}

module.exports = updateStatus
