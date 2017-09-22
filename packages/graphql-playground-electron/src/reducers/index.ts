import { combineReducers } from 'redux'
import graphiqlDocs from 'graphql-playground/lib/reducers/graphiql-docs'
import history from './history'
import files from './files'
import config from './config'

const combinedReducers = combineReducers({
  graphiqlDocs,
  history,
  files,
  config
})

export default combinedReducers
