var define = require("matchbox-util/object/define")
var Intent = require("./Intent")

module.exports = Relay

function Relay(parent) {
  this.parent = parent || null
  this.active = true

  this._connections = []
  this._intents = {}
}

define.getter(Relay.prototype, "root", function () {
  var relay = this
  if (!relay.parent) return relay

  while (relay.parent) {
    relay = relay.parent
  }

  return relay
})

Relay.prototype.activate = function () {
  this.active = true
}

Relay.prototype.deactivate = function () {
  this.active = false
}

Relay.prototype.isConnectionAllowed = function (relay, behaviour) {
  if (!(relay instanceof Relay)) {
    // Not a Relay
    return false
  }
  if (this === relay) {
    // Connecting to self
    return false
  }
  if (relay.parent != null) {
    // checking for a parent should cover transfer from the same network
    // Transferring relays is not supported
    return false
  }
  if (this.isConnectedTo(relay)) {
    // Unable to connect: already connected
    return false
  }
  return true
}

Relay.prototype.isConnectedTo = function (relay) {
  return !!~this._connections.indexOf(relay)
}

Relay.prototype.connect = function (relay) {
  if (!this.isConnectionAllowed(relay)) {
    return null
  }

  relay.parent = this
  this._connections.push(relay)

  return relay
}

Relay.prototype.disconnect = function (relay) {
  if (relay.parent == this) {
    relay.parent = null
    var i = this._connections.indexOf(relay)
    if (~i) this._connections.splice(relay, i, 1)
  }
  return relay
}

Relay.prototype.receive = function (name, handler) {
  var handlers = this._intents[name]
  if (!handlers) {
    handlers = this._intents[name] = []
  }
  handlers.push(handler)
  return this
}

Relay.prototype.transmit = function (name, data) {
  var intent = data instanceof Intent ? data : new Intent(data)
  var promise = Promise.resolve(intent)
  var interruption = new Error("interrupted")

  switch (intent.direction) {
    case "bubble":
      handle(this)
      var parent = this.parent
      while (parent) {
        handle(parent)
        parent = parent.parent
      }
      break
    case "capture":
    default:
      this.walk(handle)
  }

  function handle (relay) {
    var handlers = relay._intents[name]
    if (!Array.isArray(handlers) || !handlers.length) {
      return
    }

    handlers = handlers.map(function (handler) {
      return promise.then(function () {
        return handler.call(relay, intent)
      }).then(function () {
        if (intent.interrupted) {
          throw interruption
        }
      })
    })

    promise = Promise.all(handlers)
  }

  return promise.then(function () {
    return intent
  }).catch(function (err) {
    if (err === interruption) {
      return intent
    }
    throw err
  })
}

Relay.prototype.walk = function (cb) {
  var relay = this

  if (cb(relay) === false) {
    return false
  }

  var connections = relay._connections
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
    if (relay._connections.length) {
      stack.push([i, connections])
      connections = relay._connections
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
}
