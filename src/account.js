'use strict';

const { derivePath } = require('ed25519-hd-key');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const bech32 = require('bech32');
const bip39 = require('bip39');

const kd = require('./crypto/browser/keyDerivation');
const signer = require('./crypto/browser/keypair');

const {ERD, MNEMONIC_LEN, HD_PREFIX} = require('./constants');

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

    const mac = crypto.createHmac('sha3-256', derivedKey.slice(16, 32))
      .update(ciphertext)
      .digest();

    if ( mac.toString('hex') !== keyFile.crypto.mac ) {
      throw new Error('MAC mismatch, possibly wrong password');
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
   * Given a password, it will generate the contents for a file containing the current initialised account's private
   *   key, passed through a password based key derivation function
   * @param password
   * @returns {{version: number, id: *, address: string, bech32: string, crypto: {ciphertext: String, cipherparams: {iv: string}, cipher: string, kdf: string, kdfparams: {dklen: number, salt: string, n: number, r: number, p: number}, mac: string}}}
   */
  generateKeyFile(password) {
    if ( !this.publicKey || !this.privateKey ) {
      console.warn("Account is not initialised");
      return;
    }

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

    const mac = crypto.createHmac('sha3-256', derivedKey.slice(16, 32))
      .update(ciphertext)
      .digest();

    return {
      version: 4,
      id: uuid({
        random:crypto.randomBytes(16)
      }),
      address: this.publicKeyAsString(),
      bech32: this.address(),
      crypto: {
        ciphertext: ciphertext.toString('hex'),
        cipherparams: {
          iv: iv.toString('hex')
        },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: kdParams,
        mac: mac.toString('hex'),
      }
    };
  }

  /**
   * Given a plaintext private key, the current account will be initialised, and a password protected file will be
   * generated with the provided private key
   * @param privateKey
   * @param password
   * @returns {{version: number, id: *, address: string, bech32: string, crypto: {ciphertext: String, cipherparams: {iv: string}, cipher: string, kdf: string, kdfparams: {dklen: number, salt: string, n: number, r: number, p: number}, mac: string}}}
   */
  generateKeyFileFromPrivateKey(privateKey, password) {
    this.loadFromSeed(privateKey);

    return this.generateKeyFile(password);
  }

  /**
   * Given the private key, regenerate public key
   * @param privateKey
   */
  loadFromPrivateKey(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = signer.generatePublicKey(privateKey);
  }

  /**
   * Given a private key, generates the public/private key pair
   *
   * @param privateKey
   */
  loadFromSeed(privateKey) {
    const [pk, sk] = signer.generatePairFromSeed(privateKey);
    this.publicKey = pk;
    this.privateKey = sk;
  }

  /**
   * Given a hex representation of the private key, regenerate public key
   * @param sk
   */
  loadFromHexPrivateKey(sk) {
    const privateKey = Buffer.from(sk, 'hex');
    this.loadFromPrivateKey(privateKey);
  }

  /**
   * Return the hex representation of the public key
   * @returns {string}
   */
  publicKeyAsString() {
    return Buffer.from(this.publicKey).toString('hex');
  }

  /**
   * Return the bech32 representation of the public key
   * @returns {string}
   */
  address() {
    let words = bech32.toWords(Buffer.from(this.publicKey));
    return bech32.encode(ERD, words);
  }

  /**
   * Returns the hex representation from the bech32 string
   * @returns {string}
   */
  hexPublicKeyFromAddress(bech32addr) {
    let dec = bech32.decode(bech32addr,256);
    return Buffer.from(bech32.fromWords(dec.words)).toString('hex');
  }

  /**
   * Returns the bech32 representation of the provided public key
   * @param publicKey
   * @returns {string}
   */
  addressFromHexPublicKey(publicKey) {
    let words = bech32.toWords(Buffer.from(publicKey, 'hex'));
    return bech32.encode(ERD, words);
  }
  
  /**
   * Return the hex representation of the public key
   * @returns {string}
   */
  privateKeyAsString() {
    return Buffer.from(this.privateKey).toString('hex');
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
   * Generate a new account file given a password
   * @param password
   * @returns {{version: number, id: *, address: string, crypto: {ciphertext: string, cipherparams: {iv: string}, cipher: string, kdf: string, kdfparams: {dklen: number, salt: string, n: number, r: number, p: number}, mac: string}}}
   */
  initNewAccountFromPassword(password) {
    this.initNewKeyPair();

    return this.generateKeyFile(password);
  }

  /**
   * Generate a new mnemonic phrase
   * @returns {string}
   */
  generateMnemonic() {
    return bip39.generateMnemonic(MNEMONIC_LEN)
  }

  /**
   * Generate private key given a mnemonic. If derive is set to true, it will return the index account
   * from the derivation path
   *
   * @param mnemonic
   * @param derive
   * @param index
   * @param password
   * @returns {string}
   */
  privateKeyFromMnemonic(mnemonic, derive = false, index = 0, password = '') {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("wrong mnemonic format");
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const {key} = derivePath(`${HD_PREFIX}/${index}'`, seed);

    return key.toString("hex");
  }

  /**
   * Loads an account from a given a mnemonic phrase
   *
   * @param mnemonic
   */
  loadFromMnemonic(mnemonic) {
    const sk = this.privateKeyFromMnemonic(mnemonic);
    return this.loadFromSeed(Buffer.from(sk, 'hex'));
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

    const sig = signer.sign(message, this.privateKey);
    return Buffer.from(sig).toString('hex');
  }
}

module.exports = Account;
