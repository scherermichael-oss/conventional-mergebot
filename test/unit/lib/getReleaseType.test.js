const getReleaseType = require('../../../lib/getReleaseType')

describe('getReleaseType', () => {
  it('is a function.', async () => {
    expect(getReleaseType).toBeInstanceOf(Function)
  })

  it('detects major release.', async () => {
    const message = [
      'feat: message 1',
      '',
      'BREAKING CHANGES: message 2'
    ].join('\n')

    expect(await getReleaseType(message)).toEqual('major')
  })

  it('interpetes \'feat\' as minor release.', async () => {
    const message = [
      'feat: message 1'
    ].join('\n')

    expect(await getReleaseType(message)).toEqual('minor')
  })

  it('interpetes \'fix\' as patch release.', async () => {
    const message = [
      'fix: message 1'
    ].join('\n')

    expect(await getReleaseType(message)).toEqual('patch')
  })
})
