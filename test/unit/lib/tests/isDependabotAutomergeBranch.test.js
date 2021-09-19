const isDependabotAutomergeBranch = require('../../../../lib/tests/isDependabotAutomergeBranch')

const pr = function (title, ref) {
  return {
    payload: {
      pull_request: {
        title,
        head: {
          ref
        }
      }
    }
  }
}

describe('isDependabotAutomergeBranch', () => {
  it('is a function.', async () => {
    expect(isDependabotAutomergeBranch).toBeInstanceOf(Function)
  })

  it('recognizes patch updates by dependabot.', async () => {
    expect(isDependabotAutomergeBranch(pr('chore(deps): bump url-parse from 1.5.1 to 1.5.3 in /.github/scripts', 'dependabot/test'))).toEqual(true)
  })

  it('works with more digits in version number.', async () => {
    expect(isDependabotAutomergeBranch(pr('chore(deps): bump url-parse from 10.51.12 to 10.51.32 in /.github/scripts', 'dependabot/test'))).toEqual(true)
  })

  it('recognizes minor updates by dependabot.', async () => {
    expect(isDependabotAutomergeBranch(pr('chore(deps): bump url-parse from 1.5.1 to 1.6.1 in /.github/scripts', 'dependabot/test'))).toEqual(true)
  })

  it('ignores major updates by dependabot.', async () => {
    expect(isDependabotAutomergeBranch(pr('chore(deps): bump url-parse from 1.5.1 to 2.5.1 in /.github/scripts', 'dependabot/test'))).toEqual(false)
  })

  it('ignores empty pr title.', async () => {
    expect(isDependabotAutomergeBranch(pr('', 'dependabot/test'))).toEqual(false)
  })

  it('ignores non-dependabot branch.', async () => {
    expect(isDependabotAutomergeBranch(pr('chore(deps): bump url-parse from 1.5.1 to 1.5.3 in /.github/scripts', 'my-branch/test'))).toEqual(false)
  })
})
