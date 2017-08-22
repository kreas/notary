/* global chrome  */
import keyManager from './lib/key_manager'
import m from 'mithril'

//
// Model
//

const User = {
  get: vnode => {
    chrome.storage.local.get('notaryUser', res => {
      vnode.state.user = res.notaryUser || {}
      m.redraw()
    })
  },
  set: user => {
    chrome.storage.local.set({'notaryUser': user}, res => res)
  }
}

//
// Helper functions
//

const exportKey =
  type => _ => {
    keyManager.exportKey(type)
  }

//
// Views
//

const inputComponent = {
  view: vnode => {
    let {label, field, user} = vnode.attrs

    if (!user) return null

    return user && m('label', [
      label,
      m('input.u-full-width', {
        type: 'text',
        value: user[field],
        oninput: e => {
          // m.withAttr('value', user[field])
          user[field] = e.target.value
        }
      })
    ])
  }
}

const userForm =
  vnode => {
    let user = vnode.state.user

    return user && m('form', [
      m('fieldset', [
        m('div.container', [
          m('div.row', [
            m('div.five.columns', [
              m(inputComponent, {
                label: 'First Name',
                field: 'first_name',
                user
              })
            ]),
            m('div.two.columns', [
              m(inputComponent, {
                label: 'Middle Initial',
                field: 'middle_initial',
                user
              })
            ]),
            m('div.five.columns', [
              m(inputComponent, {
                label: 'Last Name',
                field: 'last_name',
                user
              })
            ])
          ]), // div.row
          m('div.row', [
            m('div.six.columns', [
              m(inputComponent, {
                label: 'Phone Number',
                field: 'phone_number',
                user
              })
            ]),
            m('div.six.columns', [
              m(inputComponent, {
                label: 'Email Address',
                field: 'email_address',
                user
              })
            ])
          ]), // div.row
          m('div.row', [
            m('div.twelve.columns', [
              m(inputComponent, {
                label: 'Organization',
                field: 'organization',
                user
              })
            ])
          ]),  // div.row
          m('div.row', [
            m('div.twelve.columns', [
              m(inputComponent, {
                label: 'Address',
                field: 'address',
                user
              })
            ])
          ]), // div.row
          m('div.row', [
            m('div.eight.columns', [
              m(inputComponent, {
                label: 'City',
                field: 'city',
                user
              })
            ]),
            m('div.two.columns', [
              m(inputComponent, {
                label: 'State',
                field: 'state',
                user
              })
            ]),
            m('div.two.columns', [
              m(inputComponent, {
                label: 'Zip',
                field: 'zip',
                user
              })
            ])
          ]) // div.row
        ]) // div.container
      ])
    ])
  }

const exportKeysButtons =
  vnode => {
    return m('div.container', m('div.tweleve.columns', [
      m('a.button', {
        onclick: exportKey('private'), style: 'margin-right: 15px'}, 'Export Private Key'),
      m('a.button', {onclick: exportKey('public')}, 'Export Public Key')
    ]))
  }

const view =
  vnode => {
    return m('div#app', [
      m('div#header.container', [
        m('h1', 'Notary')
      ]),
      userForm(vnode),
      exportKeysButtons()
    ])
  }

m.mount(document.body, {
  onupdate: vnode => {
    User.set(vnode.state.user)
  },
  oninit: vnode => {
    User.get(vnode)
    keyManager.createKeyPair()
  },
  view
})
