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
    const tx = new Transaction(1, "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa", "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa");
    const txBuffForSigning = tx.prepareForSigning();
    const txForSigning = JSON.parse(txBuffForSigning.toString());
    
    // assert that fields not specified on the constructor are not initialised
    assert.isUndefined(txForSigning.gasPrice, "gasPrice should have not been defined");
    assert.isUndefined(txForSigning.gasLimit, "gasLimit should have not been defined");
    assert.isUndefined(txForSigning.data, "data should have not been defined");
  });
});
