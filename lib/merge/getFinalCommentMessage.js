'use strict'

const debug = require('debug')('app:getFinalCommentMessage')

const getMergeComment = require('./getMergeComment')
const getReleaseType = require('../getReleaseType')

const getSuccessMessage = async function ({ commitMessage }) {
  debug('composeSuccessMessage')

  const releaseType = await getReleaseType(commitMessage.full)
  const successComment = releaseType ? [
    '🎉 Pull Request Merged 🎉',
    '',
    'This pull request has been merged with the following commit message:',
    '',
    '``````',
    commitMessage.full,
    '``````',
    '',
    `A **${releaseType}** release is triggered.`
  ] : [
    '🎉 Pull Request Merged 🎉',
    '',
    'No type of pull request detected. Therefore, no release is triggered.'
  ]

  return successComment.join('\n')
}

const getErrorMessage = async function ({ context, exception }) {
  debug('composeErrorMessage')

  let errorMessage
  try {
    errorMessage = JSON.parse(exception.message).message
  } catch (exJson) {
    errorMessage = exception.message
  }

  const comment = await getMergeComment(context)

  return [
    '⚠️ Merging Pull Request Failed ⚠️',
    '',
    errorMessage,
    '',
    `Merge will be **automatically retried** on any change. Delete the [/merge comment](${comment.html_url}) to stop.`
  ].join('\n')
}

const getFinalCommentMessage = async function ({ context, exception = null, commitMessage = null }) {
  debug('Start')

  let message = ''
  if (exception) {
    message = await getErrorMessage({ context, exception })
  } else {
    message = await getSuccessMessage({ context, commitMessage })
  }

  return message
}

module.exports = getFinalCommentMessage
