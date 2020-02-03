"use strict";

class Transaction {
  constructor(nonce = 0, from = '', to = '', value = '', gasPrice = '', gasLimit = '', data = '') {
    Transaction.validateAddresses([from, to]);
    this.nonce = nonce;
    this.sender = from;
    this.receiver = to;
    this.value = value;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.data = data;

    // Set an empty signature for start
    this.signature = '';
  }

  /**
   * Returns the Buffer representation of the current transaction in order for it to be signed
   * @returns {Buffer}
   */
  prepareForSigning() {
    let mainTx = {
      nonce: this.nonce,
      value: this.value,
      // We encode sender and receiver as base64 for signing to match the go's implementation
      receiver: Buffer.from(this.receiver, 'hex').toString('base64'),
      sender: Buffer.from(this.sender, 'hex').toString('base64'),
    };

    // The following properties which are optional are added only if they are set up
    if ( this.gasPrice ) {
      mainTx.gasPrice = this.gasPrice;
    }
    if ( this.gasLimit ) {
      mainTx.gasLimit = this.gasLimit;
    }
    if ( this.data ) {
      mainTx.data = Buffer.from(this.data).toString('base64');
    }

    return Buffer.from(JSON.stringify(mainTx));
  }

  prepareForNode() {
    return {
      nonce: this.nonce,
      value: this.value,
      receiver: this.receiver,
      sender: this.sender,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      data: this.data,
      signature: this.signature,
    }
  }

  static validateAddresses(addresses) {
    for ( let address of addresses ) {
      if ( Buffer.from(address, 'hex').length !== 32 ) {
        throw Error("invalid address length");
      }
    }
  }
}

module.exports = Transaction;
