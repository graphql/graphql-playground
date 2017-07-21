export type ADD_STACK = 'add stack'
export const ADD_STACK: ADD_STACK = 'add stack'

export interface AddStackAction {
  type: ADD_STACK
  field: any
  level: number
}

export const addStack = (field: any, level: number): AddStackAction => ({
  type: 'add stack',
  field,
  level,
})
