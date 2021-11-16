const fs = require('fs');
const account = require('./src/account');

const shardId = 1;
const nrOfWallets = 10;
let foundWallets = [];
const savePath = './mnemonics.txt';

while(foundWallets.length < nrOfWallets) {
  const accG = new account();
  const mnemonic = accG.generateMnemonic();
  accG.loadFromMnemonic(mnemonic);
  const accShard = computeShardID(accG.address());
  if (accShard === shardId) {
    foundWallets.push(`${accG.address()}\n${mnemonic}`);
  }
}

const text = foundWallets.join('\n');
fs.writeFileSync(savePath, text);

function computeShardID(address) {
  const acc = new account();
  const pubKey = Buffer.from(acc.hexPublicKeyFromAddress(address), 'hex');
  const startingIndex = pubKey.length - 1;

  const usedBuffer = pubKey.slice(startingIndex);

  let addr = 0;
  for (let i = 0; i < usedBuffer.length; i++) {
    addr = (addr<<8) + usedBuffer[i];
  }

  let n = Math.ceil(Math.log2(3));
  let maskHigh = (1 << n) - 1;
  let maskLow = (1 << (n-1)) - 1;

  let shard = addr & maskHigh;
  if ( shard > 2 ) {
    shard = addr & maskLow;
  }

  return shard;
}
