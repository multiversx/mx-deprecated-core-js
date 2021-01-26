const {assert} = require('chai');
const account = require('../src/account');
const Transaction = require('../src/transaction');

describe('transaction', function() {
  before(function() {
    this.account = new account();
    this.account.initNewKeyPair();
    this.transaction = new Transaction({
      nonce: 1,
      from: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
      to: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
      value: "999",
      gasPrice: 10,
      gasLimit: 100,
      data: "tx-data"
    });
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
    const tx = new Transaction({
      nonce: 1,
      from: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
      to: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
    });
    const txBuffForSigning = tx.prepareForSigning();
    const txForSigning = JSON.parse(txBuffForSigning.toString());
    
    // assert that fields not specified on the constructor are not initialised
    assert.isUndefined(txForSigning.gasPrice, "gasPrice should have not been defined");
    assert.isUndefined(txForSigning.gasLimit, "gasLimit should have not been defined");
    assert.isUndefined(txForSigning.data, "data should have not been defined");
  });

  it("computes correct fee with data field", () => {
    let transaction = new Transaction({
      nonce: 92,
      value: "123456789000000000000000000000",
      to: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
      from: "erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa",
      data: "testdata",
      gasPrice: 500,
      gasLimit: 12010,
      chainID: "local-testnet",
      version: 1
    });

    let fee = transaction.computeFee({minGasLimit: 10, gasPerDataByte: 1500, gasPriceModifier: 0.01});
    assert.equal(fee.toString(), "6005000");
  });
});
