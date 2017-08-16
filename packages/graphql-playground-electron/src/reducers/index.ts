import { combineReducers } from 'redux'
import graphiqlDocs from 'graphql-playground/lib/reducers/graphiql-docs'
import history from './history'
import files from './files'

const combinedReducers = combineReducers({
  graphiqlDocs,
  history,
  files
})

export default combinedReducers
