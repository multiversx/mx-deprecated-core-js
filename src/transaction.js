"use strict";

const bech32 = require('bech32');
const BigNumber = require('bignumber.js');

class Transaction {
  constructor({
                nonce = 0,
                from = '',
                to = '',
                senderUsername = '',
                receiverUsername = '',
                value = '',
                gasPrice = '',
                gasLimit = '',
                data = '',
                chainID='',
                version = 0,
                options = 0
  }) {
    Transaction.validateAddresses([from, to]);
    this.nonce = nonce;
    this.sender = from;
    this.receiver = to;
    this.senderUsername = senderUsername;
    this.receiverUsername = receiverUsername;
    this.value = value;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.data = data;
    this.chainID = chainID;
    this.version = version;
    this.options = options;

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
      receiver: this.receiver,
      sender: this.sender,
    };

    // The following properties which are optional are added only if they are set up
    if ( this.senderUsername ) {
      mainTx.senderUsername = this.senderUsername;
    }
    if ( this.receiverUsername ) {
      mainTx.receiverUsername = this.receiverUsername;
    }
    if ( this.gasPrice ) {
      mainTx.gasPrice = this.gasPrice;
    }
    if ( this.gasLimit ) {
      mainTx.gasLimit = this.gasLimit;
    }
    if ( this.data ) {
      mainTx.data = Buffer.from(this.data).toString('base64');
    }
    if ( this.chainID ) {
      mainTx.chainID = this.chainID;
    }
    if ( this.version ) {
      mainTx.version = this.version;
    }
    if ( this.options ) {
      mainTx.options = this.options;
    }

    let mainTxJSON = JSON.stringify(mainTx);
    return Buffer.from(mainTxJSON);
  }

  prepareForNode() {
    return {
      nonce: this.nonce,
      value: this.value,
      receiver: this.receiver,
      sender: this.sender,
      senderUsername: this.senderUsername,
      receiverUsername: this.receiverUsername,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      data: Buffer.from(this.data).toString('base64'),
      chainID: this.chainID,
      version: this.version,
      options: this.options,
      signature: this.signature,
    }
  }

  computeFee({minGasLimit, gasPerDataByte, gasPriceModifier}) {
    let moveBalanceGas = minGasLimit + Buffer.from(this.data).length * gasPerDataByte;
    let intGasLimit = parseInt(this.gasLimit);
    let intGasPrice = parseInt(this.gasPrice);
    if (moveBalanceGas > intGasLimit) {
      throw new Error(`Not enough gas provided ${intGasLimit}`);
    }

    let gasPrice = new BigNumber(intGasPrice);
    let feeForMove = (new BigNumber(moveBalanceGas)).multipliedBy(gasPrice);
    if (moveBalanceGas === intGasLimit) {
      return feeForMove;
    }

    let diff = new BigNumber(intGasLimit - moveBalanceGas);
    let modifiedGasPrice = gasPrice.multipliedBy(new BigNumber(gasPriceModifier));
    let processingFee = diff.multipliedBy(modifiedGasPrice);

    return feeForMove.plus(processingFee);
  }

  static validateAddresses(addresses) {
    for ( let address of addresses ) {
      try {
        bech32.decode(address);
      } catch (e) {
        throw new Error("invalid bech32 address");
      }
    }
  }
}

module.exports = Transaction;
