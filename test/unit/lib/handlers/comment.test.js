'use strict'

const _ = require('lodash')

let mergeCalled
jest.doMock('../../../../lib/merge', () => {
  return async () => { mergeCalled = true }
})
jest.doMock('../../../../lib/buildResultMessage', () => {
  return async () => { return '' }
})
jest.doMock('../../../../lib/checks/isWip', () => {
  return () => { return false }
})

const handleComment = require('../../../../lib/handlers/comment')

const contextTemplate = {
  payload: {
    comment: {
      body: ''
    },
    issue: {
      number: 123,
      pull_request: { }
    }
  },
  repo: () => {},
  octokit: {
    issues: {
      createComment: () => { }
    },
    pulls: {
      get: () => {
        return {
          data: {
            state: 'open'
          }
        }
      }
    }
  }
}
let context

describe('handleComment', () => {
  beforeEach(() => { // eslint-disable-line
    mergeCalled = false
    context = _.cloneDeep(contextTemplate)
  })

  it('is a function.', async () => {
    expect(handleComment).toBeInstanceOf(Function)
  })

  it('ignores empty comments.', async () => {
    context.payload.comment.body = ''
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })

  it('ignores non-merge comments.', async () => {
    context.payload.comment.body = 'foo'
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })

  it('ignores non-merge comments that contains the command.', async () => {
    context.payload.comment.body = 'foo\n/merge'
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })

  it('ignores non-merge comments that starts with the command.', async () => {
    context.payload.comment.body = '/merge\nfoo'
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })

  it('handles merge comments.', async () => {
    context.payload.comment.body = '/merge'
    await handleComment(context)
    expect(mergeCalled).toBeTruthy()
  })

  it('handles merge comments with whitespaces.', async () => {
    context.payload.comment.body = '   /merge   '
    await handleComment(context)
    expect(mergeCalled).toBeTruthy()
  })

  it('ignore merge commits not associated sith pull requests.', async () => {
    context.payload.comment.body = '/merge'
    context.payload.issue.pull_request = null
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })

  it('do not merge closed pull requests.', async () => {
    context.payload.comment.body = '/merge'
    context.octokit.pulls.get = () => { return { data: { state: 'closed' } } }
    await handleComment(context)
    expect(mergeCalled).toBeFalsy()
  })
})
