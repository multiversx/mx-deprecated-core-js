'use strict';

const crypto = require('crypto');
const uuid = require('uuid/v4');

const kd = require('./crypto/browser/keyDerivation');
const signer = require('./crypto/browser/keypair');
const sha3 = require('./crypto/browser/sha3');

class Account {
  /**
   * Account's constructor. If a keyfile is provided, public/private key are loaded from there
   * @param keyFile
   * @param password
   */
  constructor(keyFile = null, password = null) {
    this.privateKey = null;
    this.publicKey = null;

    if ( !keyFile ) {
      return;
    }

    if ( !password ) {
      console.warn("empty password provided for the keyfile");
      return;
    }

    this.loadFromKeyFile(keyFile, password)
  }

  /**
   * Given a keyfile, load public/private keypair
   * @param keyFile
   */
  loadFromKeyFile(keyFile) {

  }

  /**
   * Given the private key, regenerate public key
   * @param privateKey
   */
  loadFromPrivateKey(privateKey) {

  }

  /**
   * Generates a new EdDSA25519 keypair
   * @returns {*[]}
   */
  initNewKeyPair() {
    const [ publicKey, privateKey ] = signer.keyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;

    return [ this.publicKey, this.privateKey ]
  }

  initNewAccountFromPassword(password) {
    this.initNewKeyPair();
    const kdParams = {
      dklen: 32,
      salt: crypto.randomBytes(32).toString('hex'),
      n: 4096,
      r: 8,
      p: 1,
    };
    const iv = crypto.randomBytes(16);
    const derivedKey = kd.generateDerivedKey(Buffer.from(password), kdParams.salt, kdParams.n, kdParams.r, kdParams.p, kdParams.dklen);

    const cipher = crypto.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv);
    const ciphertext = Buffer.concat([cipher.update(this.privateKey), cipher.final()]);
    const mac = sha3(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex'), iv, new Buffer('aes-128-ctr')]));

    console.log(this.publicKey);

    return {
      version: 4,
      id: uuid({
        random:crypto.randomBytes(16)
      }),
      address: Buffer.from(this.publicKey).toString('hex'),
      crypto: {
        ciphertext: ciphertext.toString('hex'),
        cipherparams: {
          iv: iv.toString('hex')
        },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: kdParams,
        mac: mac.toString('hex'),
        machash: "sha3256"
      }
    };
  }

  /**
   * Creates a signature over a message using Schnorr signature scheme
   * @param message
   */
  sign(message) {
    if ( !this.privateKey ) {
      console.warn("account is not initialized, cannot sign message");
      return;
    }

    return signer.sign(message, this.privateKey);
  }
}

module.exports = Account;
