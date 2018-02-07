import { Reducer } from 'redux'
import { combineReducers } from 'redux-immutable'
import docs from './state/docs/reducers'
import sessions from './state/sessions/reducers'

const combinedReducers: Reducer<any> = combineReducers({
  docs,
  sessions,
})

export default combinedReducers
