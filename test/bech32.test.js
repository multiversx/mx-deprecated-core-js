const bech32 = require('bech32');
const crypto = require('crypto');

describe('bech32', function() {
  it('works correctly', function () {
    const ERD = 'erd';
    let hash = 'seed';

    const hasher = crypto.createHash('sha256');
    hasher.update(hash);
    hash = hasher.digest('hex');
    let words = bech32.toWords(Buffer.from(hash, 'hex'));
    let bechString = bech32.encode(ERD, words);

    let dec = bech32.decode(bechString,256);
    let decodedHash = Buffer.from(bech32.fromWords(dec.words)).toString('hex');

    console.log(hash);
    console.log(decodedHash);
  });

  it('fails on insertions', function() {
    const ERD = 'erd';

    let hash = 'seed';
    let iterations = 0;
    let testFails = false;
    while ( true ) {
      const hasher = crypto.createHash('sha256');
      hasher.update(hash);
      hash = hasher.digest('hex');
      let words = bech32.toWords(Buffer.from(hash, 'hex'));
      let bechString = bech32.encode(ERD, words);

      if ( bechString.substr(bechString.length - 1) === 'p' ) {
        try {
          bechString = `${bechString.substr(0, bechString.length - 1)}qp`;
          let dec = bech32.decode(bechString,256);
          let decodedHash = Buffer.from(bech32.fromWords(dec.words)).toString('hex');

          if ( hash === decodedHash ) {
            console.log('EQUAL: ');
            console.log('    -> ', hash);
            console.log('    -> ', decodedHash);
          } else {
            console.log('NOT EQUAL: ');
            console.log('    -> ', hash);
            console.log('    -> ', decodedHash);
          }

          // If we get here after alteration the test should fail
          testFails = true;
          break;
        } catch (e) {}
      }

      iterations++;
      if ( iterations > 1000 ) {
        break;
      }
    }

  });
});