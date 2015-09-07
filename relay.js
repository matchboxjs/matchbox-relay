var core = require("matchbox-core")
var Transmission = require("./Transmission")
var IntentFilter = require("./IntentFilter")
var MapSet = require("matchbox-collections/MapSet")
var ArrayMap = require("matchbox-collections/ArrayMap")
var defaults = require("matchbox-util/defaults")

var Relay = module.exports = core({

  constructor: function (name, parent) {
    this.name = name || ""
    this.parent = parent || null
    this.active = true

    this._connections = new ArrayMap()
    this._intentFilters = new MapSet()
  },

  get: {
    root: function(){
      var component = this
      if (!component.parent) return component

      while (component.parent) {
        component = component.parent
      }

      return component
    }
  },

  prototype: {
    connect: function (relay) {
      if (!relay) {
        console.error("Empty arguments")
        return null
      }
      if (this == relay) {
        console.warn("Connecting to self")
        return this
      }
      if (relay instanceof Relay && relay.parent != null) {
        // checking for a parent should cover transfer from the same network
        console.warn("Transferring relays is not supported")
        return relay
      }

      if (this.hasConnection(relay)) {
        return typeof relay == "string"
          ? this._connections.get(relay)
          : this._connections.get(relay.name)
      }

      relay.parent = this
      this._connections.add(relay.name, relay)

      return relay
    },
    hasConnection: function (relay) {
      return relay != null && (typeof relay == "string"
          ? this._connections.has(relay)
          : this._connections.has(relay.name))
    },
    walk: function (cb) {
      var relay = this

      if (cb(relay) === false) {
        return false
      }

      var connections = relay._connection
      var l = connections.length

      if (!l) return true

      var stack = []
      var i = -1

      while (++i < l) {
        relay = connections[i]
        if (cb(relay) === false) {
          return false
        }

        // save state/progress and change list to sub components
        if (relay._connection.length) {
          stack.push([i, connections])
          connections = relay._connection
          i = -1
          l = connections.length
        }
        // restore state/progress to previous relay list
        else restoreStack()
      }

      function restoreStack () {
        while (i + 1 == l && stack.length) {
          i = stack.pop()
          connections = i[1]
          i = i[0]
          l = connections.length
        }
      }

      return true
    },
    relay:function (name, data, options) {
      options = defaults(options, {
        global: true,
        async: false,
        bubble: false
      })

      var transmission = new Transmission(this, options)
      return transmission.process(name, data)
    },
    intent: function (name, handler) {
      this._intentFilters.add(name, new IntentFilter(handler))
      return this
    }
  }
})
