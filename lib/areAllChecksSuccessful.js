'use strict'

// See: https://dev.to/gr2m/github-api-how-to-retrieve-the-combined-pull-request-status-from-commit-statuses-check-runs-and-github-action-results-2cen

const debug = require('debug')('app:areAllChecksSuccessful')

const areAllChecksSuccessful = async function (context) {
  debug('Start')

  const commitContext = context.repo({ ref: context.payload.pull_request.head.sha })
  debug(`Context: ${JSON.stringify(commitContext)}`)

  // https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
  const { data: { state: commitStatusState } } = await context.github.repos.getCombinedStatusForRef(commitContext)
  debug(`CommitStatus: ${commitStatusState}`)
  // https://developer.github.com/v3/checks/runs/#list-check-runs-for-a-specific-ref
  const checks = await context.github.paginate(
    context.github.checks.listForRef.endpoint.merge(commitContext)
  )
  debug(`Checks: ${JSON.stringify(checks)}`)

  const allChecksSuccessOrNeutral = checks.every((check) => { ['success', 'neutral'].includes(check.conclusion) })
  debug(`allChecksSuccessOrNeutral: ${allChecksSuccessOrNeutral}`)

  return commitStatusState === 'success' && allChecksSuccessOrNeutral
}

module.exports = areAllChecksSuccessful
