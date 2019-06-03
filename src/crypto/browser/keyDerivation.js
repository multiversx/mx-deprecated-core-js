'use strict';

const scryptsy = require('scryptsy');

const generateDerivedKey = (key, salt = '', nrOfIterations = 4096, memFactor = 8, pFactor = 1, dkLen = 32) => {
  return scryptsy(key, salt, nrOfIterations, memFactor, pFactor, dkLen);
};

module.exports = {
  generateDerivedKey: generateDerivedKey
};
