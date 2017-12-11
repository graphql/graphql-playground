import { compose, createStore } from 'redux'
import persistState, { mergePersistedState } from 'redux-localstorage'
import filter from 'redux-localstorage-filter'
import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
import { merge } from 'lodash'
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

const composeEnhancers = compose

const storage = composeEnhancers(filter(['history.history']))(
  adapter(localStorage),
)

const reducer = composeEnhancers(
  mergePersistedState((initialState, persistedState) => {
    return merge({}, initialState, persistedState)
  }),
)(combinedReducers)

const enhancer = composeEnhancers(
  persistState(storage, 'graphql-playground-electron'),
)

const functions = [enhancer]
//
// if (window.__REDUX_DEVTOOLS_EXTENSION__) {
//   functions.push(window.__REDUX_DEVTOOLS_EXTENSION__())
// }

export default () =>
  createStore(reducer, composeEnhancers.apply(null, functions))
