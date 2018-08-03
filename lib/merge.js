'use strict'

const debug = require('debug')('app:merge')

const merge = async function ({ context, title, message, head, number, releaseType }) {
  if (!releaseType) {
    return debug('No release type given. Abort merge.')
  }

  const fullMessage = message ? `${title}\n\n${message}` : title
  const data = context.repo({
    body: [
      '**Pull Request Merged**',
      '',
      'This pull request has been merged with the following Conventional Commit message:',
      '```',
      fullMessage,
      '```',
      '',
      `A **${releaseType}** release will be created (at least).`
    ].join('\n'),
    commit_message: message,
    commit_title: title,
    merge_method: 'squash',
    number,
    sha: head.sha
  })

  try {
    await context.github.pullRequests.merge(data)
    await context.github.issues.createComment(data)
  } catch (ex) {
    debug('Error while merging pull request:', JSON.parse(ex.message).message)
  }
}

module.exports = merge
