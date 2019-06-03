'use strict';

const signer = require('./crypto/browser/keypair');

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
  loadFormPrivateKey(privateKey) {

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
