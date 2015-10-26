var inherit = require("matchbox-factory/inherit")
var Radio = require("matchbox-radio")

module.exports = Intent

function Intent(data) {
  this.data = data
  this.interrupted = false
  this.direction = "capture" // "bubble"
}

inherit(Intent, Radio)

/**
 * Interrupting an intent will halt its propagation.
 * It optionally accepts a reason that will automatically
 * refuse the intent.
 *
 * You can only interrupt an intent once.
 * Subsequent calls to interrupt will do nothing.
 * */
Intent.prototype.interrupt = function(){
  if( this.interrupted ) return
  this.interrupted = true
}
