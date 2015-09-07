module.exports = IntentFilter

function IntentFilter (handler) {
  this.handler = handler
}

IntentFilter.prototype.handle = function (intent, next) {
  this.handler(intent, next)
  return intent.interrupted
}
