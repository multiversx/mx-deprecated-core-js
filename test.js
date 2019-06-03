'use strict';

const core = require('./index');

const acc = new core.account();
acc.initNewKeyPair();

console.log(acc);