'use strict';

const tweetnacl = require('tweetnacl');

const keyPair = _ => {
  const kp = tweetnacl.sign.keyPair();
  return [ kp.publicKey, kp.secretKey ]
};

const sign = ( message, privateKey ) => {
  const sig = tweetnacl.sign(message, privateKey);
  // By default, the signature contains the message at the end, we don't need this
  return sig.slice(0, sig.length - message.length)
};

module.exports = {
  keyPair: keyPair,
  sign: sign
};
