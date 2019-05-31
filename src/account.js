'use strict';

import {keyPair} from "./crypto/browser/keypair";

class Account {
  /**
   * Account's private key
   */
  privateKey;

  /**
   * Account's public key
   */
  publicKey;

  /**
   * Account's constructor. If a keyfile is provided, public/private key are loaded from there
   * @param keyFile
   * @param password
   */
  constructor(keyFile = null, password = null) {
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
  generatePair() {
    const [ publicKey, privateKey ] = keyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;

    return [ this.publicKey, this.privateKey ]
  }
}

module.exports = Account;