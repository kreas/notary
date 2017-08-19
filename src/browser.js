import { SHA256, enc } from 'crypto-js'

let Notary = {
  signPayload: data => {
    return SHA256(data, 'test').toString(enc.Base64)
  }
}

global.Notary = Notary
