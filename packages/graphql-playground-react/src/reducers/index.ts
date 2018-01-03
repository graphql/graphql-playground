import { combineReducers, Reducer } from 'redux'
import graphiqlDocs from './graphiql-docs'

const combinedReducers: Reducer<any> = combineReducers({
  graphiqlDocs,
})

export default combinedReducers
