'use strict'

const debug = require('debug')('app:merge')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')

const merge = async function ({ context }) {
  debug('Start')

  const { title, head, body, number } = context.payload.pull_request
  let message = extractMessage(title, body)
  let releaseType = await getReleaseType(message.full)

  if (!releaseType) {
    await context.github.issues.createComment(context.repo({
      body: 'No type of pull request detected. Performing normal merge.',
      number
    }))
    message = {};
  }

  let successComment = [ '🎉 Pull Request Merged 🎉' ];

  successComment = !message.full ? successComment : successComment.concat([
    '',
    'This pull request has been merged with the following commit message:',
    '',
    '``````',
    message.full,
    '``````',
    '',
    `A **${releaseType}** release is triggered.`
  ])

  successComment = successComment.join('\n');

  const data = context.repo({
    body: successComment,
    commit_message: message.body,
    commit_title: message.title,
    merge_method: 'squash',
    number,
    sha: head.sha
  })

  try {
    await context.github.pullRequests.merge(data)
    await context.github.issues.createComment(data)
  } catch (ex) {
    const errorMessage = JSON.parse(ex.message).message
    data.body = [
      '✘ Merging Pull Request Failed ✘',
      '',
      errorMessage
    ].join('\n')
    await context.github.issues.createComment(data)
    debug('An error occurred while merging:', errorMessage)
  }
}

module.exports = merge
