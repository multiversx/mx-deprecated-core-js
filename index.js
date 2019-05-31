'use strict';

const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

const keypair = nacl.sign.keyPair();
console.log(keypair);
console.log(naclUtil.decodeUTF8("message"));
const sig = nacl.sign(naclUtil.decodeUTF8("message"), keypair.secretKey);

console.log(sig);

/*const curve = require('bcrypto/lib/ed25519-browser');
const hash256 = require('bcrypto/lib/sha512');
const Schnorr = require('bcrypto/lib/js/schnorr');

const mySchnorr = new Schnorr(curve.curve, hash256);
console.log(curve);
const key = curve.privateKeyGenerate();
const pub = curve.publicKeyCreate(key);

curve.sign()

const actualBuffer = Buffer.concat([pub, key]);


const message = hash256.digest(Buffer.from("testMessage", 'ascii'));
const sig = mySchnorr.sign(message, key);
const vr = mySchnorr.verify(message, sig, pub);*/
