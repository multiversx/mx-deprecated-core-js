const {assert} = require('chai');
const account = require('../src/account');
const Transaction = require('../src/transaction');

describe('transaction', function() {
  before(function() {
    this.account = new account();
    this.account.initNewKeyPair();
  });

  it('validates bech32 addresses', function() {
    assert.throws(function() {
      Transaction.validateAddresses([this.account.publicKeyAsString()]);
    }.bind(this), "invalid bech32 address");

    assert.doesNotThrow(function() {
      Transaction.validateAddresses([this.account.address()]);
    }.bind(this), Error)
  });

});