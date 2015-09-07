var internals = require("matchbox-internals")
var radio = require("matchbox-radio")

module.exports = Intent

function Intent(data) {
  this.data = data
  this.rejected = false
  this.interrupted = false
  this.async = false
  this.state = {}
}

internals(Intent).inherit(radio)

Intent.include(radio)

/**
 * Reject is a simple built in mechanism to help
 * propagate errors and rejections.
 * Rejecting an intent will not stop its propagation.
 *
 * You can reject an intent many times.
 * */
Intent.prototype.reject = function( rejection, reason ){
  this.rejected = true
  this.state(rejection, reason)
}
/**
 * Interrupting an intent will halt its propagation.
 * It optionally accepts a reason that will automatically
 * refuse the intent.
 *
 * You can only interrupt an intent once.
 * Subsequent calls to interrupt will do nothing.
 * */
Intent.prototype.interrupt = function( interruption, reason ){
  if( this.interrupted ) return
  this.interrupted = true
  if( typeof reason != "undefined" ) this.reject(interruption, reason)
}

/**
 * Set the intents state
 * */
Intent.prototype.state = function( name, value ){
  if( typeof name == "string" && typeof value != "undefined" ){
    this.state[name] = value
  }
  else {
    for( var prop in name ){
      if( name.hasOwnProperty(prop) ) this.state[prop] = name[prop]
    }
  }
}
