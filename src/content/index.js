/* global chrome */
import signer from './signer'

const injectNotary =
  () => {
    let scriptTag = document.createElement('script')
    let container = document.head
    scriptTag.src = chrome.extension.getURL('browser.bundle.js')

    container.insertBefore(scriptTag, container.children[0])
  }

window.addEventListener('message', e => console.log(e))

signer.addSignEventHandler()
injectNotary()
