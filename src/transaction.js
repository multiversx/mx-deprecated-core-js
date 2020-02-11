"use strict";

const pb = require('./proto/transaction_pb');

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

  /**
   * Returns the protobuf representation of the current transaction in order for it to be signed
   * @return {!Uint8Array}
   */
  prepareForSigningProto() {
    let tpb = new pb.Transaction;

    tpb.setNonce(this.nonce)
    tpb.setValue(Transaction.toErdBigInt(this.value))
    tpb.setRcvaddr(Buffer.from(this.receiver, 'hex'));
    tpb.setSndaddr(Buffer.from(this.sender, 'hex'));

    // The following properties which are optional are added only if they are set up
    if (this.gasPrice) {
      tpb.setGasprice(this.gasPrice);
    }
    if (this.gasLimit) {
      tpb.setGaslimit(this.gasLimit);
    }
    if (this.data) {
      tpb.setData(this.data);
    }

    return tpb.serializeBinary();
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

  /**
   * Converts the provided value to elrond's protobuf big int representation
   * @returns {Buffer}
   */
  static toErdBigInt(value) {
    // Format  <sign><absolute value>
    // Where <sign> one byte (0 for positive, 1 for negative)
    //       <absolute value> any number of bytes representing
    //                        the absolute value (bigendian)
    let zero = Buffer.from('0000', 'hex')

    var bi = BigInt(value)
    if (bi === 0) {
      return zero
    }
    let sign = '00'

    if (bi < 0) {
      sign = '01'
      bi = bi * -1n
    }
    let abs = bi.toString(16);
    if (abs.length % 2) {
      abs = "0" + abs
    }
    return Buffer.from( sign + abs, 'hex')
  }

}

module.exports = Transaction;
