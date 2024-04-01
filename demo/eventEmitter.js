'use strict'
const eventEmitter = require('events')

module.exports = {
  on: (event, fn) => {
    eventEmitter.on(event, (...args) => {
      fn.apply(this, args)
    })
  },
  emitter: event => {
    eventEmitter.emitter(event)
  },
}
