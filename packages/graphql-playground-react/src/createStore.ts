import { compose, createStore, Store } from 'redux'
import persistState, { mergePersistedState } from 'redux-localstorage'
import filter from 'redux-localstorage-filter'
import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
import { merge } from 'lodash'
import rootReducer from './state/root/reducers'
import { fromJS, isKeyed } from 'immutable'
import createSagaMiddleware from 'redux-saga'

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

const storage = compose(filter([]))(adapter(localStorage))

const reducer = compose(
  mergePersistedState((initialState, persistedState) => {
    return fromJS(merge({}, initialState, persistedState), converter)
  }),
)(rootReducer)

const enhancer = compose(persistState(storage, 'graphql-playground'))

const functions = [enhancer, createSagaMiddleware()]

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default (): Store<any> =>
  createStore(reducer, composeEnhancers.apply(null, functions))

function converter(k, v) {
  return isKeyed(v)
    ? k === 'sessions' ? v.toOrderedMap() : v.toMap()
    : v.toList()
}
