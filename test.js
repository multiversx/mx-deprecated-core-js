'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key');

const hexSeed = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
const receiver = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const sk = 'ZjdhMDNhNDczNjYyZjA2NzczZDA0OTIyZWNkODc4MWZlYTE2ZmVmNTQzNTMxODI4MTQ0ZjE0YTk2ZmFmNTYwNg==';

// Build a fresh account
const senderAcc = new account();
const hexSk = Buffer.from(sk, 'base64').toString();
const hexPrivate = Buffer.from(hexSk, 'hex');

// All good here :)

senderAcc.loadFromSeed(hexPrivate);

// // Transaction with gasPrice, gasLimit, Data
const myNewTx1 = new transaction(0, senderAcc.publicKeyAsString(), receiver, "999", 10, 100000, "!!!!!");

const txBeforeSigning = myNewTx1.prepareForSigning();
myNewTx1.signature = senderAcc.sign(txBeforeSigning);

const senderAcc2 = new account();
const mnemonic = senderAcc2.generateMnemonic();
console.log(mnemonic);
senderAcc2.loadFromMnemonic(mnemonic);

senderAcc2.generateKeyFile('password');

const myNewTx2 = new transaction(0, senderAcc2.publicKeyAsString(), receiver, "999", 10, 100000, "!!!!!");
const txBeforeSigning2 = myNewTx2.prepareForSigning();
myNewTx2.signature = senderAcc2.sign(txBeforeSigning2);

console.log(JSON.stringify(myNewTx2.prepareForNode()));
