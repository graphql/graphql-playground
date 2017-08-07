import { compose, createStore } from 'redux'
import persistState, { mergePersistedState } from 'redux-localstorage'
import filter from 'redux-localstorage-filter'
import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
import * as merge from 'lodash/merge'
import combinedReducers from './reducers'

let localStorage: any = null

if (typeof window !== 'undefined') {
  localStorage = window.localStorage
} else {
  localStorage = {
    clearItem: () => null,
    getItem: () => null,
    setItem: () => null,
  }
}

const storage = compose(
  filter([
    'graphiqlDocs.docsOpen',
    'graphiqlDocs.docsWidth',
    'history.history',
  ]),
)(adapter(localStorage))

const reducer = compose(
  mergePersistedState((initialState, persistedState) => {
    return merge({}, initialState, persistedState)
  }),
)(combinedReducers)

const enhancer = compose(persistState(storage, 'graphiql'))

const functions = [enhancer]

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  functions.push(window.__REDUX_DEVTOOLS_EXTENSION__())
}

export default () => createStore(reducer, compose.apply(null, functions))
