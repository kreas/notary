/* global chrome, btoa */

const crypto = window.crypto
const usages = ['sign', 'verify']
const alg = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: {name: 'SHA-256'}
}

const importKey =
  (jwk, usages) => crypto.subtle.importKey('jwk', jwk, alg, true, usages)

const createAndSaveAKeyPair =
  () => {
    return crypto.subtle.generateKey(alg, true, usages)
      .then(res => {
        Object.keys(res).forEach(key => {
          exportKeyToStorage(res[key])
        })
      })
  }

const exportKeyToStorage =
  key => {
    return window.crypto.subtle.exportKey('jwk', key)
      .then(res => {
        // TODO: This is not ideal, the JWK should be stored in a much more
        // secure way.
        chrome.storage.local.set({[key.type]: res})
      })
  }

const setKeys =
  () => {
    chrome.storage.local.get(['public', 'private'], res => {
      if (!res.public || !res.private) {
        createAndSaveAKeyPair()
      }
    })
  }

const deleteKeys =
  () => chrome.storage.local.remove(['public', 'private'])

const exportPublicKey =
  () => {
    chrome.storage.local.get('public', key => {
      importKey(key.public, ['verify'])
        .then(res => {
          crypto.subtle.exportKey('spki', res)
          .then(key => generateKeyBlob(key))
        })
    })
  }

const exportPrivateKey =
  () => {
    chrome.storage.local.get('private', key => {
      importKey(key.private, ['sign'])
        .then(res => {
          crypto.subtle.exportKey('pkcs8', res)
          .then(key => generateKeyBlob(key))
        })
    })
  }

const generateKeyBlob =
  key => {
    let base64Cert = arrayBufferToBase64String(key)
    let blob = generateKeyFile(base64Cert, 'PRIVATE KEY')
    return window.URL.createObjectURL(blob)
  }

const generateKeyFile =
  (base64Cert, label) => {
    var pemCert = '-----BEGIN ' + label + '-----\r\n'
    var nextIndex = 0

    while (nextIndex < base64Cert.length) {
      if (nextIndex + 64 <= base64Cert.length) {
        pemCert += base64Cert.substr(nextIndex, 64) + '\r\n'
      } else {
        pemCert += base64Cert.substr(nextIndex) + '\r\n'
      }
      nextIndex += 64
    }

    pemCert += '-----END ' + label + '-----\r\n'

    return new window.Blob([pemCert], {type: 'text/plain'})
  }

const arrayBufferToBase64String =
  arrayBuffer => {
    var byteArray = new Uint8Array(arrayBuffer)
    var byteString = ''

    byteArray.forEach(b => {
      byteString += String.fromCharCode(b)
    })

    return btoa(byteString)
  }

export default {
  setKeys,
  deleteKeys,
  exportPublicKey,
  exportPrivateKey
}
