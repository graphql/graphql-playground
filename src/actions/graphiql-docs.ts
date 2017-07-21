export type ADD_STACK = 'add stack'
export const ADD_STACK: ADD_STACK = 'add stack'

export interface AddStackAction {
  type: ADD_STACK
  field: any
  level: number
}

export const addStack = (field: any, level: number): AddStackAction => ({
  type: ADD_STACK,
  field,
  level,
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
