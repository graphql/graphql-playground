import { fecthingSagas } from './sessions/fetchingSagas'
import { sessionsSagas } from './sessions/sagas'
import { all, AllEffect } from 'redux-saga/effects'

export default function* rootSaga() {
  yield all([...sessionsSagas, ...fecthingSagas])
}

export { AllEffect }
