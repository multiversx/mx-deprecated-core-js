'use strict';

const core = require('./index');

const acc = new core.account();
const kd = acc.initNewAccountFromPassword("testpass");

const acc2 = new core.account();
acc2.loadFromKeyFile(kd, "testpass");

console.log(acc2);