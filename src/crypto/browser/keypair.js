'use strict';

import {sign} from 'tweetnacl';

export const keyPair = _ => {
  const kp = sign.keyPair();
  return [ kp.publicKey, kp.secretKey ]
};