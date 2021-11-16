const crypto = require('crypto');
const {assert} = require('chai');
const bech32 = require("bech32");
const account = require('../src/account');
const fs = require('fs');
const { derivePath } = require('ed25519-hd-key');
const BigNumber = require("bignumber.js");
describe('account', function() {
  it('fails on wrong password', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();

    assert.throws(function() {
      secondAccount.loadFromKeyFile(keyfile, 'wrongpassword');
    }, 'MAC mismatch, possibly wrong password');
  });

  it('throws error if message is altered', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();

    assert.throws(function() {
      keyfile.crypto.ciphertext = Buffer.from("this is a modified text", 'utf8').toString('hex');
      secondAccount.loadFromKeyFile(keyfile, 'wrongpassword');
    }, 'MAC mismatch, possibly wrong password');
  });

  it('generates keyfile and loads it back', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();

    const keyfile = firstAccount.generateKeyFile('password');
    const secondAccount = new account();
    secondAccount.loadFromKeyFile(keyfile, 'password');

    assert.deepEqual(secondAccount, firstAccount, "seccondAccount should be the same as firstAccount")
  });

  it('generates same sk', function() {
    const firstAccount = new account();
    firstAccount.initNewKeyPair();
    console.log(firstAccount.privateKeyAsString());

    const derived = derivePath( "m/44'/508'/0'/0'/0'", firstAccount.privateKey);
    // console.log(derived.key.toString('hex'));
    const secondAcc = new account();
    secondAcc.loadFromSeed(derived.key);
    console.log(secondAcc.privateKeyAsString());
  });

  it('generates custom account', function() {
    const prefix = 'clr';
    const acc = new account();
    while(true) {
      const mnemonic = acc.generateMnemonic();
      console.log(mnemonic);
      // acc.loadFromMnemonic(mnemonic);
      //
      // if ( acc.address().startsWith(`erd1${prefix}`) ) {
      //   const privateParts = {
      //     mnemonic: mnemonic,
      //     address: acc.address()
      //   };
      //
      //   const mainAddressFile = acc.generateKeyFile("fh,23Gzm");
      //   fs.writeFileSync("private.json", JSON.stringify(privateParts, null, 4));
      //   fs.writeFileSync(`${acc.address()}.json`, JSON.stringify(mainAddressFile, null, 4));
      //   break;
      // }
      break;
    }
  });

  it('generates all shards', function () {
    const acc = new account();
    const mnemonic = acc.generateMnemonic();

    let currentShard = 0;
  });

  const str = `{"version":4,"id":"a059aeaa-9144-46ed-b39f-823811b3c63a","address":"792c1675071fbbabbad42c3e77a377294e0db0cf9ad7f3fc90f0ff4e4075099f","bech32":"erd10ykpvag8r7a6hwk59sl80gmh998qmvx0nttl8lys7rl5usr4px0sfuht9l","crypto":{"ciphertext":"6568f3a51da2cde8a105fea82ece0ef48f973b695ec23faab7795ac33ad7d05a2c573a6ad761180a29cdb2adee1b2754ceb475d1cc98e42f2731a4f56b219a41","cipherparams":{"iv":"60464d4cdb39ca39154c98d5252a8cfd"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"3832d685412fbfe9fe4601fc6441147da22339fd5ebf05543efb5dac05da7464","n":4096,"r":8,"p":1},"mac":"abaef72fb397007694855cc230cec879343b6f80a110af6dea58ba7877950c0c"}}`;
  it('makes soup', function() {
    const acc = new account();
    // const mnemonic = "gap remind material couch ship advice exist media impulse frost chuckle ski clump chapter mixture dolphin recall twelve cradle august point jealous miracle immense";
    // const mnemonic = "gap remind material couch ship advice exist media impulse frost chuckle ski clump chapter mixture dolphin recall twelve cradle august point jealous miracle immense";

    let mnemonic = fs.readFileSync('/Users/ccorcov/Crypto/Keys/Personal/mnemonic').toString().trim();
    for (let i = 0; i < 13; i++) {
      if (i !== 7) {
        continue;
      }
      const sk = acc.privateKeyFromMnemonic(mnemonic, true, i);
      acc.loadFromSeed(Buffer.from(sk, 'hex'));
      console.log(`Account ${i}`);
      console.log(acc.address());
      // console.log(acc.privateKeyAsString());
      fs.writeFileSync(`/Users/ccorcov/Crypto/Keys/Personal/${i}_${acc.address()}.json`, JSON.stringify(acc.generateKeyFile("fh,23Gzm"), null, 4));
    }
  });

  it('creates new accounts', function() {
    const acc1 = new account();
    console.log(acc1.hexPublicKeyFromAddress('erd1qqqqqqqqqqqqqpgqs0a05q6p2x8g2th3yrssq8dqmyp8m94ud8ss2ecs5c'));
    acc1.initNewKeyPair();
    console.log(acc1.privateKeyAsString(), acc1.address());
    acc1.initNewKeyPair();
    console.log(acc1.privateKeyAsString(), acc1.address());
  });

  it('makes pl', function() {
    const x = Buffer.from("AcDx9x9tVXHS5JlcdmebPA6ttDM/utU6Yv4Yz7aCJ8/i", "base64");
    console.log(x.toString('hex'));
    //console.log((new BigNumber('0x' + x.toString('hex'))).toString(10));
  });
  it('makes outher pl', function() {
    const x = Buffer.from("611458", "hex").toString("ascii");
    console.log(x);
  });
  it('makes tx data', function() {
    const text = 'riddle';
    const ans = Buffer.from(text, 'ascii').toString('hex');
    console.log(ans);

    console.log(Buffer.from(`answer@${ans}`, 'ascii').toString('base64'))
  });

  it('prints pubkeys', function() {
    const betch32 = [
      'erd1vxuz9fhl757q58h2rm0zsevzlqxrfcjv5qdxxyeltkx3qjg9pv7qf044q4',
    ];

    const acc = new account();
    for (let b32 of betch32) {
      console.log(acc.hexPublicKeyFromAddress(b32));
    }
  });

  it('reverse', function() {
    const acc = new account();
    acc.loadFromSeed(Buffer.from('73ecd23535a474da6977eaf290afd3e78a50ded2823db367b97c2699366be6a6', 'hex'));
    const mainAddressFile = acc.generateKeyFile("fh,23Gzm");
    fs.writeFileSync(`del.json`, JSON.stringify(mainAddressFile, null, 4));
  });

  it('prints hex', function() {
    let text = "3062313536363832333231616438623433303763373662363064616337363530303232663331346133313966336531376435653833373138646263333035643661316263663034363162306565623163313562323439393461653164656361313330356639396463396432393462393236633462396164653237313834373861316633363461333935663661323533646132613135363138303735343061323139333937346231333462613262653631366238313065383939633564663231616132";
    console.log(
      Buffer.from(text, 'hex').toString()
    )
  });

});

function computeShardID(address) {
  const acc = new account();
  const pubKey = Buffer.from(acc.hexPublicKeyFromAddress(address), 'hex');
  const startingIndex = pubKey.length - 1;

  const usedBuffer = pubKey.slice(startingIndex);

  let addr = 0;
  for (let i = 0; i < usedBuffer.length; i++) {
    addr = addr<<8 + usedBuffer[i];
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
// 100000000000000000000
// 4092931
// 500003494611955826357
// 4092959