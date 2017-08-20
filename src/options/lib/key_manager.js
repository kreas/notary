/* global chrome, btoa */

//
// Configuration
//

const crypto = window.crypto
const usages = ['sign', 'verify']
const alg = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: {name: 'SHA-256'}
}

//
// Helper Functions
//

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

// const deleteKeys =
//   () => chrome.storage.local.remove(['public', 'private'])

//
// File Generator
//
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

//
// Download Keys
//

// Creates an invisible link on the page and clicks it to force download.
const downloadKey =
  (key, type) => {
    let params = determineDownloadParams(type)
    let base64Cert = arrayBufferToBase64String(key)
    let blob = generateKeyFile(base64Cert, params.fileHeader)
    let url = window.URL.createObjectURL(blob)

    let elm = document.createElement('a')
    elm.href = url
    elm.download = params.fileName
    document.body.appendChild(elm)
    elm.click()
    document.body.removeChild(elm)
  }

// determines the file params based on the type of key being downloaded.
const determineDownloadParams =
  type => {
    if (type === 'private') {
      return {fileName: 'scribe.priv', fileHeader: 'PRIVATE KEY'}
    } else {
      return {fileName: 'scribe.pub', fileHeader: 'PUBLIC KEY'}
    }
  }

// Public
const downloadPublicKey =
  () => {
    chrome.storage.local.get('public', key => {
      importKey(key.public, ['verify'])
        .then(res => {
          crypto.subtle.exportKey('spki', res)
          .then(key => downloadKey(key, 'public'))
        })
    })
  }

// Private
const downloadPrivateKey =
  () => {
    return chrome.storage.local.get('private', key => {
      importKey(key.private, ['sign'])
        .then(res => {
          crypto.subtle.exportKey('pkcs8', res)
            .then(key => downloadKey(key, 'private'))
        })
    })
  }

const exportKey =
  type => {
    type === 'private' ? downloadPrivateKey() : downloadPublicKey()
  }

//
// Export
//
export default {
  exportKey: type => {
    type === 'private' ? downloadPrivateKey() : downloadPublicKey()
  },

  createKeyPair: () => {
    chrome.storage.local.get(['public', 'private'], res => {
      if (!res.public || !res.private) {
        createAndSaveAKeyPair()
      }
    })
  }
}
