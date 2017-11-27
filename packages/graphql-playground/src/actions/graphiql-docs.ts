export type ADD_STACK = 'add stack'
export const ADD_STACK: ADD_STACK = 'add stack'

export type SET_STACKS = 'set stacks'
export const SET_STACKS: SET_STACKS = 'set stacks'

export type TOOGLE_DOCS = 'toggle docs'
export const TOOGLE_DOCS: TOOGLE_DOCS = 'toggle docs'

export type CHANGE_KEY_MOVE = 'change key move'
export const CHANGE_KEY_MOVE: CHANGE_KEY_MOVE = 'change key move'

export type CHANGE_WIDTH_DOCS = 'change width docs'
export const CHANGE_WIDTH_DOCS: CHANGE_WIDTH_DOCS = 'change width docs'

export interface AddStackAction {
  type: ADD_STACK
  sessionId: string
  field: any
  x: number
  y: number
}

export interface SetStacksAction {
  type: SET_STACKS
  sessionId: string
  stacks: any[]
}

export interface ToggleDocsAction {
  type: TOOGLE_DOCS
  sessionId: string
  open?: boolean
}

export interface ChangeWidthDocsAction {
  type: CHANGE_WIDTH_DOCS
  sessionId: string
  width: number
}

export interface ChangeKeyMoveAction {
  type: CHANGE_KEY_MOVE
  sessionId: string
  move: boolean
}
export const setStacks = (
  sessionId: string,
  stacks: any[],
): SetStacksAction => ({
  type: SET_STACKS,
  sessionId,
  stacks,
})

export const addStack = (
  sessionId: string,
  field: any,
  x: number,
  y: number,
): AddStackAction => ({
  type: ADD_STACK,
  sessionId,
  field,
  x,
  y,
})

export const toggleDocs = (
  sessionId: string,
  open: boolean,
): ToggleDocsAction => ({
  type: TOOGLE_DOCS,
  sessionId,
  open,
})
export const changeWidthDocs = (
  sessionId: string,
  width: number,
): ChangeWidthDocsAction => ({
  type: CHANGE_WIDTH_DOCS,
  sessionId,
  width,
})

export const changeKeyMove = (
  sessionId: string,
  move: boolean,
): ChangeKeyMoveAction => ({
  type: CHANGE_KEY_MOVE,
  sessionId,
  move,
})
