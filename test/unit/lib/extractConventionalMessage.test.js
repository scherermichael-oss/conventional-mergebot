const extractConventionalCommitMessage = require('../../../lib/extractConventionalCommitMessage')

describe('extractConventionalCommitMessage', () => {
  it('is a function.', async () => {
    expect(extractConventionalCommitMessage).toBeInstanceOf(Function)
  })

  it('extracts the message from the end of the body.', async () => {
    const body = [
      'line 1',
      'line 2',
      '## Changelog',
      'message 1',
      'message 2'
    ].join('\n')
    const expected = [
      'message 1',
      'message 2'
    ].join('\n')

    expect(extractConventionalCommitMessage(body)).toBe(expected)
  })

  it('extracts the message from the start of the body.', async () => {
    const body = [
      '## Changelog',
      'message 1',
      'message 2',
      '## Other Section',
      'line 1',
      'line 2'
    ].join('\n')
    const expected = [
      'message 1',
      'message 2'
    ].join('\n')

    expect(extractConventionalCommitMessage(body)).toBe(expected)
  })

  it('extracts the message from the middle of the body.', async () => {
    const body = [
      '## First Section',
      'line 1',
      'line 2',
      '## Changelog',
      'message 1',
      'message 2',
      '## Other Section',
      'line 1',
      'line 2'
    ].join('\n')
    const expected = [
      'message 1',
      'message 2'
    ].join('\n')

    expect(extractConventionalCommitMessage(body)).toBe(expected)
  })

  it('trims the message.', async () => {
    const body = [
      '## First Section',
      'line 1',
      'line 2',
      '## Changelog',
      '   ',
      'message 1',
      'message 2',
      '',
      '## Other Section',
      'line 1',
      'line 2'
    ].join('\n')
    const expected = [
      'message 1',
      'message 2'
    ].join('\n')

    expect(extractConventionalCommitMessage(body)).toBe(expected)
  })
})
