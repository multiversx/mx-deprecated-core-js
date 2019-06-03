'use strict';

const jsSHA = require('jssha');
const toBuffer = require('./toBuffer');

const sha3 = function () {
  const shaObj = new jsSHA("SHA3-256", "HEX");
  for (let i = 0; i < arguments.length; i++) {
    const v = toBuffer(arguments[i]);
    shaObj.update(v.toString("hex"));
  }
  return Buffer.from(shaObj.getHash("HEX"), "hex");
};

module.exports = sha3;