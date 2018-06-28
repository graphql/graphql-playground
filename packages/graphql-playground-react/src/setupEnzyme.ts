import { configure } from 'enzyme'
import * as EnzymeAdapter from 'enzyme-adapter-react-16'
import { JSDOM } from 'jsdom'

configure({ adapter: new EnzymeAdapter() })

// TODO: Fix/document this hack
// https://github.com/jsdom/jsdom#intervening-before-parsing
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  beforeParse(window) {
    window.focus = jest.fn()
  },
})
const { window } = jsdom

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce(
      (result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop),
      }),
      {},
    )
  Object.defineProperties(target, props)
}

;(global as any).window = window as any
;(global as any).document = window.document as any
;(global as any).navigator = {
  userAgent: 'node.js',
}
copyProps(window, global)

// TODO: Fix/document this hack
;(global as any).document.createRange = () => {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return {
        right: 0,
      }
    },
    getClientRects: () => {
      return {
        length: 0,
        left: 0,
        right: 0,
      }
    },
  }
}
