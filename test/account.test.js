const {assert} = require('chai');
const bech32 = require("bech32");
const account = require('../src/account');
describe('account', function() {
  it('fails on wrong password', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();

    assert.throws(function() {
      secondAccount.loadFromKeyFile(keyfile, 'wrongpassword');
    }, 'MAC mismatch, possibly wrong password');
  });

  it('throws error if message is altered', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();

    assert.throws(function() {
      keyfile.crypto.ciphertext = Buffer.from("this is a modified text", 'utf8').toString('hex');
      secondAccount.loadFromKeyFile(keyfile, 'wrongpassword');
    }, 'MAC mismatch, possibly wrong password');
  });

  it('generates keyfile and loads it back', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();
    secondAccount.loadFromKeyFile(keyfile, 'password');

    assert.deepEqual(secondAccount, firstAccount, "seccondAccount should be the same as firstAccount")
  });

  it("prints reward address", function() {
    let address = "erd1ezlzq50pq6w2wrpvchg9vd9szgay85ks8jhx9zjksezlae6j5hcsg66xtu";
    const decoded = bech32.decode(address, 256);
    console.log(Buffer.from(bech32.fromWords(decoded.words)).toString('hex'));
  })
});
