import { compose, createStore, Store, applyMiddleware } from 'redux'
// import persistState, { mergePersistedState } from 'redux-localstorage'
// import filter from 'redux-localstorage-filter'
// import * as adapter from 'redux-localstorage/lib/adapters/localStorage'
// import { merge } from 'lodash'
// import { /*fromJS, */ isKeyed } from 'immutable'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './rootSaga'
import rootReducer from './workspace/reducers'

// let localStorage: any = null

// if (typeof window !== 'undefined') {
//   localStorage = window.localStorage
// } else {
//   localStorage = {
//     clearItem: () => null,
//     getItem: () => null,
//     setItem: () => null,
//   }
// }

// const storage = compose(filter(['workspaces']))(adapter(localStorage))

// const reducer = compose(
//   mergePersistedState((initialState, persistedState) => {
//     const state = fromJS(merge({}, initialState, persistedState), converter)
//     console.log({ state })
//     return state
//   }),
// )(rootReducer)

// const enhancer = compose(persistState(storage, 'graphql-playground'))

const sagaMiddleware = createSagaMiddleware()
const functions = [/*enhancer, */ applyMiddleware(sagaMiddleware)]

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default (): Store<any> => {
  const store = createStore(
    rootReducer,
    composeEnhancers.apply(null, functions),
  )

  sagaMiddleware.run(rootSaga)
  return store
}

// function converter(k, v) {
//   return isKeyed(v)
//     ? k === 'sessions' ? v.toOrderedMap() : v.toMap()
//     : v.toList()
// }
