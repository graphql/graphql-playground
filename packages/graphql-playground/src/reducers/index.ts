import { combineReducers } from 'redux'
import graphiqlDocs from './graphiql-docs'

const combinedReducers = combineReducers({
  graphiqlDocs,
})

export default combinedReducers
