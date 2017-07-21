import {
  ADD_STACK,
  AddStackAction,
  TOOGLE_DOCS,
  ToggleDocsAction,
} from '../actions/graphiql-docs'

type GraphiqlDocsAction = AddStackAction | ToggleDocsAction

export interface State {
  readonly navStack: any[]
  readonly docsOpen: boolean
}

const defaultState: State = {
  navStack: [],
  docsOpen: false,
}

export default function graphiqlDocsReducer(
  state: State = defaultState,
  action: GraphiqlDocsAction,
) {
  switch (action.type) {
    case ADD_STACK:
      const { field, level } = action
      // If click at the root level empty the list
      if (level === 0) {
        return {
          ...state,
          navStack: [field],
        }
      }
      let newNavStack = state.navStack
      // Reset the list to the level clicked
      if (level < newNavStack.length) {
        newNavStack = newNavStack.slice(0, level)
      }
      // Check current item is not the last item of the list
      const isCurrentlyShown =
        newNavStack.length > 0 && newNavStack[newNavStack.length - 1] === field

      if (!isCurrentlyShown) {
        return {
          ...state,
          navStack: [...newNavStack, action.field],
        }
      }
      break

    case TOOGLE_DOCS:
      const { open } = action
      if (open !== undefined) {
        return {
          ...state,
          docsOpen: open,
        }
      }
      return {
        ...state,
        docsOpen: !state.docsOpen,
      }
  }
  return state
}
