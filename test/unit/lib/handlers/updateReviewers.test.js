const updateReviewers = require('../../../../lib/handlers/pullRequestChange/updateReviewers')

let topics
let labels
let userReviewRequestsToAdd
let teamReviewRequestsToAdd
let userReviewRequestsToDelete
let teamReviewRequestsToDelete

const contextTemplate = {
  payload: {
    comment: {
      body: ''
    },
    issue: {
      number: 1,
      pull_request: { }
    }
  },
  repo: (data) => { return data },
  github: {
    issues: {
      listLabelsOnIssue: () => {
        return { data: labels.map((label) => { return { name: label } }) }
      }
    },
    pulls: {
      createReviewRequest: (data) => {
        userReviewRequestsToAdd.push(...data.reviewers)
        teamReviewRequestsToAdd.push(...data.team_reviewers)
      },
      deleteReviewRequest: (data) => {
        userReviewRequestsToDelete.push(...data.reviewers)
        teamReviewRequestsToDelete.push(...data.team_reviewers)
      }
    },
    repos: {
      listTopics: () => {
        return {
          data: {
            names: topics
          }
        }
      }
    }
  }
}
let context

describe('updateReviewers', () => {
  beforeEach(() => { // eslint-disable-line
    context = Object.assign({}, contextTemplate)
    userReviewRequestsToAdd = []
    teamReviewRequestsToAdd = []
    userReviewRequestsToDelete = []
    teamReviewRequestsToDelete = []
    labels = []
    topics = []
  })

  it('is a function.', async () => {
    expect(updateReviewers).toBeInstanceOf(Function)
  })

  it('does nothing if no rules are defined.', async () => {
    const reviewUsersRules = ''
    const reviewTeamsRules = ''

    await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

    expect(userReviewRequestsToAdd).toStrictEqual([])
    expect(teamReviewRequestsToAdd).toStrictEqual([])
    expect(userReviewRequestsToDelete).toStrictEqual([])
    expect(teamReviewRequestsToDelete).toStrictEqual([])
  })

  describe('labels', () => {
    it('are used to add user.', async () => {
      labels = ['test']
      const reviewUsersRules = 'test=+user-test'
      const reviewTeamsRules = ''

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual(['user-test'])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to add team.', async () => {
      labels = ['test']
      const reviewUsersRules = ''
      const reviewTeamsRules = 'test=+team-test'

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual(['team-test'])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to delete user.', async () => {
      labels = ['test']
      const reviewUsersRules = 'test=-user-test'
      const reviewTeamsRules = ''

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual(['user-test'])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to delete team.', async () => {
      labels = ['test']
      const reviewUsersRules = ''
      const reviewTeamsRules = 'test=-team-test'

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual(['team-test'])
    })
  })

  describe('topics', () => {
    it('are used to add user.', async () => {
      topics = ['test']
      const reviewUsersRules = 'test=+user-test'
      const reviewTeamsRules = ''

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual(['user-test'])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to add team.', async () => {
      topics = ['test']
      const reviewUsersRules = ''
      const reviewTeamsRules = 'test=+team-test'

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual(['team-test'])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to delete user.', async () => {
      topics = ['test']
      const reviewUsersRules = 'test=-user-test'
      const reviewTeamsRules = ''

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual(['user-test'])
      expect(teamReviewRequestsToDelete).toStrictEqual([])
    })

    it('are used to delete team.', async () => {
      topics = ['test']
      const reviewUsersRules = ''
      const reviewTeamsRules = 'test=-team-test'

      await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

      expect(userReviewRequestsToAdd).toStrictEqual([])
      expect(teamReviewRequestsToAdd).toStrictEqual([])
      expect(userReviewRequestsToDelete).toStrictEqual([])
      expect(teamReviewRequestsToDelete).toStrictEqual(['team-test'])
    })
  })

  it('lables and topics can be used together to update review requests.', async () => {
    topics = ['team-com']
    labels = ['release/chore', 'release/patch']
    const reviewUsersRules = ''
    const reviewTeamsRules = 'team-com,release/feat=+com team-com,release/fix=+com team-com=-com'

    await updateReviewers({ context, number: 1, reviewUsersRules, reviewTeamsRules })

    expect(userReviewRequestsToAdd).toStrictEqual([])
    expect(teamReviewRequestsToAdd).toStrictEqual([])
    expect(userReviewRequestsToDelete).toStrictEqual([])
    expect(teamReviewRequestsToDelete).toStrictEqual(['com'])
  })
})
