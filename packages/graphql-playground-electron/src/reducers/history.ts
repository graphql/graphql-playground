import {
  SELECT_HISTORY,
  SelectHistoryAction,
  History,
} from '../actions/history'

type HistoryAction = SelectHistoryAction

export interface State {
  readonly history: History[]
}

const defaultState: State = {
  history: [],
}

export default function historyReducer(
  state: State = defaultState,
  action: HistoryAction,
): State {
  switch (action.type) {
    case SELECT_HISTORY:
      const { history } = action
      history.lastOpened = new Date()
      // See if already in list
      const index = state.history.findIndex(data => data.path === history.path)
      let newHistory = state.history
      if (index !== -1) {
        newHistory[index] = history
      } else {
        newHistory = [...state.history, history]
      }
      // Sort by date
      newHistory.sort((a, b) => new Date(a.lastOpened) < new Date(b.lastOpened))
      return {
        ...state,
        history: newHistory,
      }
  }
  return state
}
