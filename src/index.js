/* global chrome */

chrome.tabs.executeScript(null, {file: 'app.bundle.js'}, function (results) {
  console.log("Notary inserted.")
})
