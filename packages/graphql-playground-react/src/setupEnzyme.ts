import { configure } from 'enzyme'
import * as EnzymeAdapter from 'enzyme-adapter-react-16'
configure({ adapter: new EnzymeAdapter() })

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
