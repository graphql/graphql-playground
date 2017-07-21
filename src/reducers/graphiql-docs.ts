export interface GraphiQlState {
  navStack: any[]
}

const defaultState = {
  navStack: [],
}

export default function graphiqlDocsReducer(
  state: GraphiQlState = defaultState,
  action,
) {
  switch (action.type) {
    case 'add stack':
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
  }

  return state
}
