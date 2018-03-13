import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs from './state/docs/reducers'
import sessions from './state/sessions/reducers'
import sharing from './state/sharing/reducers'
import history from './state/history/reducers'

const combinedReducers: Reducer<any> = combineReducers({
  docs,
  sessions,
  sharing,
  history,
})

export default combinedReducers
