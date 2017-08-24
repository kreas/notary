import str2ab from 'string-to-arraybuffer'
import ab2str from 'arraybuffer-to-string'
import config from 'config'

const {alg, crypto, storage} = config

// Convert key from jwk to CryptoKey.
const importKey =
  (key, usage) =>
    crypto.subtle.importKey('jwk', key, alg, true, [usage])

// Convert a JSON payload to an ArrayBuffer so it can be sigend.
const convertPayloadtoAB =
  payload => str2ab(JSON.stringify(payload))

// Sends a message to the parent page with the signed data.
const postSignedMessage =
  signature => {
    return window.postMessage({
      type: 'signed_data',
      signature
    }, window.location.origin)
  }

//
// Exports
//
export default {
  addSignEventHandler: () => {
    window.addEventListener('message', e => {
      if (e.data.type !== 'sign') return null

      storage.get(['private', 'notaryUser'], data => {
        importKey(data.private, 'sign')
          .then(privateKey => {
            let payload = convertPayloadtoAB(e.data.payload)

            crypto.subtle.sign(alg, privateKey, payload)
              .then(signature =>
                postSignedMessage({
                  notary: data.notaryUser,
                  value: ab2str(signature, 'base64')
                })
              )
          })
      })
    })
  }
}
