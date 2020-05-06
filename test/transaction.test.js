const {assert} = require('chai');
const account = require('../src/account');
const Transaction = require('../src/transaction');

describe('transaction', function() {
  before(function() {
    this.account = new account();
    this.account.initNewKeyPair();
    this.transaction = new Transaction(1, "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa", "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa", "999", 10, 100, "tx-data");
  });

  it('validates bech32 addresses', function() {
    assert.throws(function() {
      Transaction.validateAddresses([this.account.publicKeyAsString()]);
    }.bind(this), "invalid bech32 address");

    assert.doesNotThrow(function() {
      Transaction.validateAddresses([this.account.address()]);
    }.bind(this), Error)
  });

  it('prepare transaction for signing', function() {
    assert.doesNotThrow(function() {
    this.transaction.prepareForSigning();
    }.bind(this), Error)
  });

  it('sign transaction should throw error', function() {
    assert.throws(function() {
    const signature = this.account.sign(this.transaction);
    }.bind(this), "unexpected type, use Uint8Array")
  });

  it('sign transaction should work', function() {
    assert.doesNotThrow(function() {
    const txForSign = this.transaction.prepareForSigning();
    const signature = this.account.sign(txForSign);
    assert.isTrue(signature.length > 0);
    }.bind(this), Error)
  });
});
