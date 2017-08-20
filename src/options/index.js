// import key_manager from './lib/key_manager'
import m from 'mithril'

const view =
  vnode => {
    return m('h1', 'Hello, Dave')
  }

m.render(document.body, view())
