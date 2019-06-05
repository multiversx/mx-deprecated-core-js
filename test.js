'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');

const addr = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const senderAcc = new account();
senderAcc.initNewKeyPair();

const myNewTx = new transaction(0, senderAcc.publicKeyAsString(), addr, 10);

const sig = senderAcc.sign(myNewTx.prepareForSigning());
myNewTx.signature = sig;

console.log(JSON.stringify(myNewTx.prepareForNode()));
