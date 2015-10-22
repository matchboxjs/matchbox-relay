var Relay = require("../Relay")
var assert = require("chai").assert

function test( name, fn ){
  var count = fn.length
  var relays = []
  while( count ){
    relays.unshift(new Relay())
    --count
  }
  it(name, function(  ){
    fn.apply(null, relays)
  })
}

describe("Relay", function () {
  test("root of self", function (relay) {
    assert.equal(relay.root, relay)
  })
  test("root of sub relay", function (relay1, relay2) {
    relay1.connect(relay2)
    assert.equal(relay2.root, relay1)
  })
  test("isConnectionAllowed() to self", function (relay) {
    assert.isFalse(relay.isConnectionAllowed(relay))
  })
  test("isConnectionAllowed() to detached", function (relay1, relay2) {
    assert.isTrue(relay1.isConnectionAllowed(relay2))
  })
  test("isConnectionAllowed() to connected", function (relay1, relay2) {
    relay1.connect(relay2)
    assert.isFalse(relay1.isConnectionAllowed(relay2))
  })
  test("isConnectionAllowed() to relay with parent", function (relay1, relay2, relay3) {
    relay1.connect(relay2)
    assert.isFalse(relay3.isConnectionAllowed(relay2))
  })
})
