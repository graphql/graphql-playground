import { createActions } from 'redux-actions'

export const {
  setStacks,
  addStack,
  toggleDocs,
  changeWidthDocs,
  changKeyMove,
} = createActions({
  SET_STACKS: (sessionId, stacks) => ({ sessionId, stacks }),
  ADD_STACK: (sessionId, field, x, y) => ({ sessionId, field, x, y }),
  TOGGLE_DOCS: (sessionId, open) => ({ sessionId, open }),
  CHANGE_WIDTH_DOCS: (sessionId, width) => ({ sessionId, width }),
  CHANGE_KEY_MOVE: (sessionId, move) => ({ sessionId, move }),
})
