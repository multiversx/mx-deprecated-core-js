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
   * @param password
   */
  loadFromKeyFile(keyFile, password) {
    const {kdfparams} = keyFile.crypto;
    const derivedKey = kd.generateDerivedKey(Buffer.from(password),
      Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);

    const ciphertext = Buffer.from(keyFile.crypto.ciphertext, 'hex');

    const mac = sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext,
      Buffer.from(keyFile.crypto.cipherparams.iv, 'hex'),
      Buffer.from(keyFile.crypto.cipher)]));

    if ( mac.toString('hex') !== keyFile.crypto.mac ) {
      throw new Error('Key derivation failed - possibly wrong password');
    }

    const decipher = crypto.createDecipheriv(keyFile.crypto.cipher, derivedKey.slice(0, 16),
      Buffer.from(keyFile.crypto.cipherparams.iv, 'hex'));

    let seed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    while (seed.length < 32) {
      let nullBuff = Buffer.from([0x00]);
      seed = Buffer.concat([nullBuff, seed]);
    }

    this.loadFromPrivateKey(seed);
    return this;
  }

  /**
   * Given the private key, regenerate public key
   * @param privateKey
   */
  loadFromPrivateKey(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = signer.generatePublicKey(privateKey);
  }

  publicKeyAsString() {
    return Buffer.from(this.publicKey).toString('hex');
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
    const salt = crypto.randomBytes(32);
    const kdParams = {
      dklen: 32,
      salt: salt.toString('hex'),
      n: 4096,
      r: 8,
      p: 1,
    };
    const iv = crypto.randomBytes(16);
    const derivedKey = kd.generateDerivedKey(Buffer.from(password), salt, kdParams.n, kdParams.r, kdParams.p, kdParams.dklen);

    const cipher = crypto.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv);
    const ciphertext = Buffer.concat([cipher.update(this.privateKey), cipher.final()]);

    const mac = sha3(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex'), iv, Buffer.from('aes-128-ctr')]));

    return {
      version: 4,
      id: uuid({
        random:crypto.randomBytes(16)
      }),
      address: this.publicKeyAsString(),
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
