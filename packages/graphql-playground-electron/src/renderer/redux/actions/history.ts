export type SELECT_HISTORY = 'select history'
export const SELECT_HISTORY: SELECT_HISTORY = 'select history'

export interface SelectHistoryAction {
  type: SELECT_HISTORY
  history: History
}

export interface History {
  type: 'local' | 'endpoint'
  path: string
  lastOpened?: Date
}

export const selectHistory = (history: History): SelectHistoryAction => ({
  type: SELECT_HISTORY,
  history,
})
