import { put, takeLatest, ForkEffect } from 'redux-saga/effects'

function* runQuery(action) {
  // run the query
  consnole.log(`runQuery`, action)
  const { payload } = action
  yield put({
    type: 'ADD_RESPONSE',
    sessionId: payload.sessionId,
    response: { date: { hello: 'world' } },
  })
}

export default function* sessionsSaga() {
  yield takeLatest('RUN_QUERY', runQuery)
}

export { ForkEffect }
