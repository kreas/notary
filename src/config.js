/* global chrome */

export default {
  appId: 'pnclijnjfojfcbhkapkmoejfdpblebno',
  usages: ['sign', 'verify'],
  alg: {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: {name: 'SHA-256'}
  },
  crypto: window.crypto,
  storage: chrome.storage ? chrome.storage.local : {}
}
