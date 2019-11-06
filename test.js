'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');

const receiver = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const sk = 'ZjdhMDNhNDczNjYyZjA2NzczZDA0OTIyZWNkODc4MWZlYTE2ZmVmNTQzNTMxODI4MTQ0ZjE0YTk2ZmFmNTYwNg==';

// Build a fresh account
const senderAcc = new account();

const hexSk = Buffer.from(sk, 'base64').toString();
const hexPublic = Buffer.from('2d7aa683fbb37eafc2426bfe63e1c20aa5872ee4627c51b6789f41bfb8d31fdb', 'hex');
const hexPrivate = Buffer.from(hexSk, 'hex');

// All good here :)

senderAcc.loadFromSeed(hexPrivate);

// Transaction with gasPrice, gasLimit, Data
const myNewTx1 = new transaction(0, senderAcc.publicKeyAsString(), receiver, "999", 1, 10, "!!!!!");

myNewTx1.signature = senderAcc.sign(myNewTx1.prepareForSigning());


console.log('MyTx1', JSON.stringify(myNewTx1.prepareForNode()));
