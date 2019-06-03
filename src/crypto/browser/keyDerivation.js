'use strict';

const scryptsy = require('scryptsy');

const generateDerivedKey = (key, salt = '', nrOfIterations = 4096, memFactor = 8, pFactor = 1) => {
  return scryptsy(key, salt, nrOfIterations, memFactorm, pFactor);
};

module.exports = {
  generateDerivedKey: generateDerivedKey
};
