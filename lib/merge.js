'use strict'

const debug = require('debug')('app:merge')

const extractConventionalCommitMessage = require('./extractConventionalCommitMessage')
const getReleaseType = require('./getReleaseType')

const merge = async function ({ context }) {
  debug('Start')

  const { title, head, body, number } = context.payload.pull_request
  const message = extractConventionalCommitMessage(body)
  let releaseType = await getReleaseType(`${title}\n\n${message}`)

  if (!releaseType) {
    debug('No release type given. Skip.')
    await context.github.issues.createComment(context.repo({
      body: [
        'Description does not contain a type keyword. Please add one of the following prefixes to the title:',
        '',
        '  - feat',
        '  - fix',
        '  - chore',
        '',
        'Alternatively, you can merge the pull request manually without triggering a new release. **No entry** will be created in the changelog.'
      ].join('\n'),
      number
    }))
    return
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
      `A **${releaseType}** release will be created${releaseType === 'major' ? '' : ' at least'}.`
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
