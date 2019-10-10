'use strict';

const tweetnacl = require('./nacl-fast');

const keyPair = _ => {
  const kp = tweetnacl.sign.keyPair();
  return [ kp.publicKey, kp.secretKey ]
};

const generatePublicKey = (privateKey) => {
  const kp = tweetnacl.sign.keyPair.fromSecretKey(privateKey);

  return kp.publicKey;
};

const generatePairFromSeed = (privateKey) => {
  privateKey = Uint8Array.from(privateKey);
  const kp = tweetnacl.sign.keyPair.fromSeed(privateKey);

  return [ kp.publicKey, kp.secretKey ]
};

const sign = ( message, privateKey ) => {
  const sig = tweetnacl.sign(message, privateKey);
  // By default, the signature contains the message at the end, we don't need this
  return sig.slice(0, sig.length - message.length)
};

module.exports = {
  keyPair: keyPair,
  sign: sign,
  generatePublicKey: generatePublicKey,
  generatePairFromSeed: generatePairFromSeed,
};
