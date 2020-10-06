'use strict';
const bls = require('@elrondnetwork/bls-wasm');

const init = async () => {
  await bls.init(bls.BLS12_381)
};

const generatePairFromSeed = (privateKey) => {
  const sec = new bls.SecretKey();
  sec.setLittleEndian(Uint8Array.from(Buffer.from(privateKey, 'hex')));
  const pub = sec.getPublicKey();

  return {
    publicKey: Buffer.from(pub.serialize()).toString('hex'),
    privateKey: Buffer.from(sec.serialize()).toString('hex'),
  }
};

const sign = (message, privateKey) => {
  const sec = new bls.SecretKey();
  sec.setLittleEndian(Uint8Array.from(Buffer.from(privateKey, 'hex')));
  const msg = Uint8Array.from(Buffer.from(message, 'hex'));

  return Buffer.from(sec.sign(msg).serialize()).toString('hex');
};

module.exports = {
  generatePairFromSeed,
  sign,
  init,
};
