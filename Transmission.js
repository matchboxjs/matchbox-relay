var Intent = require("./intent")
var defaults = require("matchbox-util/defaults")
var extend = require("matchbox-util/extend")

module.exports = Transmission

function Transmission (relay, options) {
  this.relay = relay
  this.finished = false
  extend(this, defaults(options, {
    global: true,
    async: false,
    bubble: false
  }))
}

Transmission.prototype.finish = function () {
  this.finished = true
}

Transmission.prototype.process = function (name, data) {
  var transmission = this
  var intent = data instanceof Intent ? data : new Intent(data)
  var relay = this.global ? this.relay.root : this.relay

  if (this.bubble) {
    var parent = this.relay.parent

    while( parent ){
      handleRelay(parent)
      if( handleRelay(parent) === false ){
        transmission.finish()
        return intent
      }
      parent = parent.parent
    }
    transmission.finish()
  }
  else {
    if (this.async) {
      var allFilters = []

      relay.walk(this, function (relay) {
        var ifs = relay._intentFilters.get(name)
        if (ifs && ifs.length) {
          allFilters = allFilters.concat(ifs)
        }
      })

      function next (err) {
        if (!allFilters.length || err || intent.interrupted) {
          transmission.finish(err)
        }
        else {
          var filter = allFilters.shift()
          filter.handle(intent, next)
          if (intent.interrupted) {
            transmission.finish()
          }
        }
      }

      next()
    }
    else {
      relay.walk(handleRelay)

      transmission.finish()
    }
  }

  function handleRelay (relay) {
    var filters = relay._intentFilters.get(name)
    if (!filters) return true

    // stop relaying if the intent was interrupted
    return !filters.some(function (filter) {
      return filter.handle(intent)
    })
  }

  return intent
}
