'use strict'

const getenv = require('getenv')

const config = JSON.parse(getenv('CONFIG', '{ "preset": "angular" }'))

module.exports = config
