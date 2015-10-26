matchbox-relay [![Build Status](https://travis-ci.org/matchboxjs/matchbox-relay.svg)](https://travis-ci.org/matchboxjs/matchbox-relay)
==============

Transmit/receive promise based intents in a tree topology.

## Description

Relays are great tools for implementing app level communication with decoupled components.
They form a tree shaped network by connecting, and interact with each other through intents.
These Intents carry data during a transmission, which relays can intercept by registering to the intent's channel.

Relays are much like a pub/sub event system;
the important difference is relays form a tree network and listeners are promise based.
