'use strict';

const account = require('./src/account');
const transaction = require('./src/transaction');

const receiver = '53669be65aac358a6add8e8a8b1251bb994dc1e4a0cc885956f5ecd53396f0d8';

// Build a fresh account
const senderAcc = new account();
senderAcc.initNewKeyPair();

// Transaction with gasPrice, gasLimit, Data
const myNewTx1 = new transaction(0, senderAcc.publicKeyAsString(), receiver, 10, 10, 1000, receiver);

// Transaction with gasPrice, gasLimit, no Data
const myNewTx2 = new transaction(0, senderAcc.publicKeyAsString(), receiver, 10, 10, 1000);

// Transaction with no gasLimit, no gasPrice, no Data
const myNewTx3 = new transaction(0, senderAcc.publicKeyAsString(), receiver, 10);

myNewTx1.signature = senderAcc.sign(myNewTx1.prepareForSigning());
myNewTx2.signature = senderAcc.sign(myNewTx2.prepareForSigning());
myNewTx3.signature = senderAcc.sign(myNewTx3.prepareForSigning());

console.log('MyTx1', JSON.stringify(myNewTx1.prepareForNode()));
console.log('MyTx2', JSON.stringify(myNewTx2.prepareForNode()));
console.log('MyTx3', JSON.stringify(myNewTx3.prepareForNode()));

console.log('Bech32 of sender account',senderAcc.publicKeyAsBech32String());
