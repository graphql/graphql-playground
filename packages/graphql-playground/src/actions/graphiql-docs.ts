export type ADD_STACK = 'add stack'
export const ADD_STACK: ADD_STACK = 'add stack'

export interface AddStackAction {
  type: ADD_STACK
  field: any
  x: number
  y: number
}

export const addStack = (field: any, x: number, y: number): AddStackAction => ({
  type: ADD_STACK,
  field,
  x,
  y,
})

export type TOOGLE_DOCS = 'toggle docs'
export const TOOGLE_DOCS: TOOGLE_DOCS = 'toggle docs'

export interface ToggleDocsAction {
  type: TOOGLE_DOCS
  open?: boolean
}

export const toggleDocs = (open: boolean): ToggleDocsAction => ({
  type: TOOGLE_DOCS,
  open,
})

export type CHANGE_WIDTH_DOCS = 'change width docs'
export const CHANGE_WIDTH_DOCS: CHANGE_WIDTH_DOCS = 'change width docs'

export interface ChangeWidthDocsAction {
  type: CHANGE_WIDTH_DOCS
  width: number
}

export const changeWidthDocs = (width: number): ChangeWidthDocsAction => ({
  type: CHANGE_WIDTH_DOCS,
  width,
})

export type CHANGE_KEY_MOVE = 'change key move'
export const CHANGE_KEY_MOVE: CHANGE_KEY_MOVE = 'change key move'

export interface ChangeKeyMoveAction {
  type: CHANGE_KEY_MOVE
  move: boolean
}

export const changeKeyMove = (move: boolean): ChangeKeyMoveAction => ({
  type: CHANGE_KEY_MOVE,
  move,
})
