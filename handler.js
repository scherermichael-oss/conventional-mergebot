const { serverless } = require('@probot/serverless-lambda')

const probotPlugin = require('./')

module.exports.probot = serverless(probotPlugin)
