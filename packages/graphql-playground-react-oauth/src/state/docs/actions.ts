import { createActions } from 'redux-actions'

export const {
  setStacks,
  addStack,
  toggleDocs,
  setDocsVisible,
  changeWidthDocs,
  changeKeyMove,
  showDocForReference,
} = createActions({
  SET_STACKS: (sessionId, stacks) => ({ sessionId, stacks }),
  ADD_STACK: (sessionId, field, x, y) => ({ sessionId, field, x, y }),
  TOGGLE_DOCS: (sessionId, activeTabIdx) => ({ sessionId, activeTabIdx }),
  SET_DOCS_VISIBLE: (sessionId, open, activeTabIdx?) => ({
    sessionId,
    open,
    activeTabIdx,
  }),
  CHANGE_WIDTH_DOCS: (sessionId, width) => ({ sessionId, width }),
  CHANGE_KEY_MOVE: (sessionId, move) => ({ sessionId, move }),
  SHOW_DOC_FOR_REFERENCE: reference => ({ reference }),
})
