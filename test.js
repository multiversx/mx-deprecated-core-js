'use strict';

const core = require('./index');

const acc = new core.account();
const kd = acc.initNewAccountFromPassword("testpass");
console.log(kd);