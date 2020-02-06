'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');

const receiver = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const sk = 'ZjdhMDNhNDczNjYyZjA2NzczZDA0OTIyZWNkODc4MWZlYTE2ZmVmNTQzNTMxODI4MTQ0ZjE0YTk2ZmFmNTYwNg==';

// Build a fresh account
const senderAcc = new account();
const hexSk = Buffer.from(sk, 'base64').toString();
const hexPrivate = Buffer.from(hexSk, 'hex');
senderAcc.loadFromSeed(hexPrivate);

// Transaction with gasPrice, gasLimit, Data
const myNewTx1 = new transaction(0, senderAcc.publicKeyAsString(), receiver, "999", 10, 100000, "!!!!!");

const txBeforeSigning = myNewTx1.prepareForSigning();
myNewTx1.signature = senderAcc.sign(txBeforeSigning);
console.log("tx with signature from an account loaded from the older version plain private key: \n",
  JSON.stringify(myNewTx1.prepareForNode()));

const senderAcc2 = new account();
const mnemonic = senderAcc2.generateMnemonic();
console.log("generated mnemonic: \n", mnemonic);
senderAcc2.loadFromMnemonic(mnemonic);

const myNewTx2 = new transaction(0, senderAcc2.publicKeyAsString(), receiver, "999", 10, 100000, "!!!!!");
const txBeforeSigning2 = myNewTx2.prepareForSigning();
myNewTx2.signature = senderAcc2.sign(txBeforeSigning2);

console.log('tx with signature from an account loaded from a mnemonic phrase: \n', JSON.stringify(myNewTx2.prepareForNode()));
