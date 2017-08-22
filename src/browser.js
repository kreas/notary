let Notary = {
  signPayload: payload => {
    return window.postMessage({type: 'sign', payload}, '*')
  }
}

global.Notary = Notary
