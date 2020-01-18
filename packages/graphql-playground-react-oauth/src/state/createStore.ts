import { compose, createStore, Store, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './rootSaga'
import rootReducer from './workspace/reducers'
import { getSelectedSession } from './sessions/selectors'
import { serializeState, deserializeState } from './localStorage'

const sagaMiddleware = createSagaMiddleware()
const functions = [applyMiddleware(sagaMiddleware)]

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const initialState = deserializeState()

export default (): Store<any> => {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers.apply(null, functions),
  )

  store.subscribe(serializeState(store))
  ;(window as any).s = store
  ;(window as any).session = () => {
    return getSelectedSession(store.getState())
  }

  sagaMiddleware.run(rootSaga)
  return store
}
