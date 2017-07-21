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
}

export const toggleDocs = (): ToggleDocsAction => ({
  type: TOOGLE_DOCS,
})
