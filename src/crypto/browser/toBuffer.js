'use strict';

const  BigNumber = require('bignumber.js');
const toBuffer = (v) => {
  if ( Buffer.isBuffer(v) ) return v;
  if (v === null || v === undefined) {
    throw new Error('toBuffer called with empty value');
  }

  if (Array.isArray(v)) {
    v = Buffer.from(v);
  } else if (typeof v === 'string') {
    if (isHexString(v)) {
      v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
    } else {
      v = Buffer.from(v);
    }
  } else if (typeof v === 'number') {
    v = intToBuffer(v);
  } else if (isBigNumber(v)) {
    v = Buffer.from(padToEven(v.toString(16)), 'hex');
  } else if (v.toArray) {
    v = Buffer.from(v.toArray());
  } else if (v.subarray) {
    v = Buffer.from(v);
  } else {
    throw new Error('invalid type');
  }

  return v;
};

const stripHexPrefix = str => {
  if (typeof str !== 'string') {
    return str;
  }
  return isHexPrefixed(str) ? str.slice(2) : str;
};

const isHexPrefixed = str => {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
};


function isHexString(value, length) {
  if (typeof(value) !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) { return false; }

  return true;
}

const padToEven = value => {
  if (typeof value !== 'string') {
    throw new Error('padToEven only support string');
  }

  if (value.length % 2) {
    value = '0' + a;
  }

  return value;
};

const intToBuffer = i => {
  const hex = intToHex(i);
  return new Buffer(hex.slice(2), 'hex');
};

// returns hex string from int
const intToHex = i => {
  const hex = i.toString(16); // eslint-disable-line

  return '0x' + padToEven(hex);
};

const isBigNumber = (obj) => {
  return obj instanceof BigNumber ||
    (obj && obj.constructor && obj.constructor.name === 'BigNumber');
};

module.exports = toBuffer;
