import { put, takeLatest, ForkEffect, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { getSelectedSession, getOperations } from './selectors'
import getSelectedOperationName from '../../components/Playground/util/getSelectedOperationName'
import { Session } from '../../types'
import { schemaFetcher } from '../../components/Playground'
import { getQueryFacts } from '../../components/Playground/util/getQueryFacts'
import { fromJS, is } from 'immutable'
import {
  setVariableToType,
  setOperations,
  setOperationName,
  runQuery,
  schemaFetchingSuccess,
  schemaFetchingError,
  fetchSchema,
} from './actions'
import { getRootMap, getNewStack } from '../../components/Playground/util/stack'
import { DocsSessionState } from '../docs/reducers'
import { setStacks } from '../docs/actions'

function* runQuerySaga(action) {
  // run the query
  // console.log(`runQuery`, action)
  const { payload } = action
  yield put({
    type: 'ADD_RESPONSE',
    sessionId: payload.sessionId,
    response: { date: { hello: 'world' } },
  })
}

function* setQueryFacts() {
  // debounce by 150 ms
  yield call(delay, 150)
  const session: Session = yield select(getSelectedSession)

  const schema = yield schemaFetcher.fetch(session)
  const queryFacts = getQueryFacts(schema, session.query)

  if (queryFacts) {
    const operationName = getSelectedOperationName(
      session.operations,
      session.operationName,
      schema,
    )
    const immutableQueryFacts = fromJS(queryFacts)
    if (!is(immutableQueryFacts.variableToType, session.variableToType)) {
      // set variableToType
      yield call(setVariableToType, immutableQueryFacts.variableToType)
    }
    if (!is(immutableQueryFacts.operations, session.operations)) {
      // set operations
      yield call(setOperations, immutableQueryFacts.operations)
    }
    if (operationName !== session.operationName) {
      yield call(setOperationName, operationName)
    }
  }
}

function* runQueryAtPosition(action) {
  const { position } = action.payload
  const session: Session = yield select(getSelectedSession)
  if (session.operations) {
    let operationName
    for (const operation of session.operations) {
      if (operation.loc.start <= position && operation.loc.end >= position) {
        operationName = operation.name && operation.name.value
      }
    }
    yield call(runQuery, operationName)
  }
}

function* fetchSchemaSaga() {
  const session: Session = yield select(getSelectedSession)
  yield schemaFetcher.refetch(session)
  try {
    yield call(schemaFetchingSuccess)
  } catch (e) {
    yield call(schemaFetchingError)
    yield call(delay, 5000)
    yield call(fetchSchema)
  }
}

function* renewStacks() {
  const session: Session = yield select(getSelectedSession)
  const docs: DocsSessionState = yield select(getSelectedSession)
  const schema = yield schemaFetcher.fetch(session)
  const rootMap = getRootMap(schema)
  const stacks = docs.navStack
    .map(stack => getNewStack(rootMap, schema, stack))
    .filter(s => s)
  yield call(setStacks, session.id, stacks)
}

export default function* sessionsSaga() {
  yield takeLatest('RUN_QUERY', runQuerySaga)

  // subscribe to several queries
  yield takeLatest('GET_QUERY_FACTS', setQueryFacts)
  yield takeLatest('SET_OPERATION_NAME', setQueryFacts)
  yield takeLatest('EDIT_QUERY', setQueryFacts)
  yield takeLatest('RUN_QUERY_AT_POSITION', runQueryAtPosition)
  yield takeLatest('FETCH_SCHEMA', fetchSchemaSaga)
  yield takeLatest('SCHEMA_FETCHING_SUCCESS', renewStacks)
}

export { ForkEffect }
