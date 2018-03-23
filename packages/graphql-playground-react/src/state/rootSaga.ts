import { fecthingSagas } from './sessions/fetchingSagas'
import { sessionsSagas } from './sessions/sagas'
import { all, AllEffect } from 'redux-saga/effects'
import { sharingSagas } from './sharing/sharingSaga'

export default function* rootSaga() {
  yield all([...sessionsSagas, ...fecthingSagas, ...sharingSagas])
}

export { AllEffect }
