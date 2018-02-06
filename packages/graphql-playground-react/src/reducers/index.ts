import { combineReducers, Reducer } from 'redux'
import docs from './docs'

const combinedReducers: Reducer<any> = combineReducers({
  docs,
})

export default combinedReducers
