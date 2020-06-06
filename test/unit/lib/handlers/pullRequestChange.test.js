const pullRequestChange = require('../../../../lib/handlers/pullRequestChange')

describe('pullRequestChange', () => {
  it('is a function.', async () => {
    expect(pullRequestChange).toBeInstanceOf(Function)
  })
})
