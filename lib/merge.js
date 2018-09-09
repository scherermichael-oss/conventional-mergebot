'use strict'

const debug = require('debug')('app:merge')
const getenv = require('getenv')

const extractMessage = require('./extractMessage')
const getReleaseType = require('./getReleaseType')

const merge = async function ({ context }) {
  debug('Start')

  const { title, head, body, number } = context.payload.pull_request
  const message = extractMessage(title, body)
  let releaseType = await getReleaseType(message.full)
  const allowManualMerge = getenv.boolish('ALLOW_MANUAL_MERGE', true)

  const mergeInfo = [
    'Title does not contain a type keyword. Please add one of the following prefixes to the title:',
    '',
    '- `feat:` for new features (minor release)',
    '- `fix:` for bugfixes (patch release)',
    '',
    'To provide more information add the following section to the description:',
    '```',
    '### Details',
    '',
    '<Your description>',
    '```',
    '',
    'To create a major release add the following section to the description:',
    '```',
    '### Breaking Changes',
    '',
    '<Short title of the breaking changes>',
    '',
    '<Your description of the breaking changes>',
    '```',
    '',
    'To reference tickets add the following section to the description:',
    '```',
    '### References',
    '',
    '<Reference to a ticket>',
    '```'
  ]
  const manualMergeInfo = [
    '',
    'Alternatively, you can merge the pull request manually without triggering a new release. **No entry** will be created in the changelog.'
  ]
  if (allowManualMerge) {
    mergeInfo.push(...manualMergeInfo)
  }

  if (!releaseType) {
    debug('No release type given. Skip.')
    await context.github.issues.createComment(context.repo({
      body: mergeInfo.join('\n'),
      number
    }))
    return
  }

  const data = context.repo({
    body: [
      '🎉 Pull Request Merged 🎉',
      '',
      'This pull request has been merged with the following commit message:',
      '',
      '``````',
      message.full,
      '``````',
      '',
      `A **${releaseType}** release is triggered. Please do not forget to delete the branch.`
    ].join('\n'),
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
    debug('Error while merging pull request:', JSON.parse(ex.message).message)
  }
}

module.exports = merge
