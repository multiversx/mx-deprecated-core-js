'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');

const receiver = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const sk = 'ZjdhMDNhNDczNjYyZjA2NzczZDA0OTIyZWNkODc4MWZlYTE2ZmVmNTQzNTMxODI4MTQ0ZjE0YTk2ZmFmNTYwNg==';

const assert = require('assert');

// Build a fresh account
const senderAcc = new account();
const hexSk = Buffer.from(sk, 'base64').toString();
const hexPrivate = Buffer.from(hexSk, 'hex');
senderAcc.loadFromSeed(hexPrivate);

function testBigInt(val, expected) {
	var actual = transaction.toErdBigInt(val);
	assert.deepEqual(actual, expected);
}

testBigInt(0,                  new Uint8Array([0x00, 0x00]));
testBigInt("random string",    new Uint8Array([0x00, 0x00]));
testBigInt(1/0,                new Uint8Array([0x00, 0x00]));
testBigInt(1,                  new Uint8Array([0x00, 0x01]));
testBigInt(-1,                 new Uint8Array([0x01, 0x01]));
testBigInt(256,                new Uint8Array([0x00, 0x01, 0x00]));
testBigInt(-256,               new Uint8Array([0x01, 0x01, 0x00]));

// full transaction
function toHexString(byteArray) {
  return byteArray.reduce((output, elem) =>
    (output + "0x" + ('0' + elem.toString(16)).slice(-2) + ", "),
    ' ');
}

const fullTx = new transaction(1, senderAcc.publicKeyAsString(), receiver, 0xabcdef, 2, 3, "data");
console.log("Tx Proto", toHexString(fullTx.prepareForSigningProto()))

fullTx.signature = senderAcc.sign(fullTx.prepareForSigningProto());
console.log('Tx Protobuf signed', JSON.stringify(fullTx.prepareForNode()));

