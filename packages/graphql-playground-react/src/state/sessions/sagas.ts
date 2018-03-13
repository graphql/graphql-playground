import {
  put,
  takeLatest,
  ForkEffect,
  call,
  select,
  takeEvery,
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { getSelectedSession } from './selectors'
import getSelectedOperationName from '../../components/Playground/util/getSelectedOperationName'
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
import { HistoryState } from '../history/reducers'
import { getSelectedWorkspace } from '../root/reducers'
import { addHistoryItem } from '../history/actions'
import { SessionProps } from '../../types'

function* setQueryFacts() {
  // debounce by 150 ms
  yield call(delay, 150)
  const session: SessionProps = yield select(getSelectedSession)

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
  const session: SessionProps = yield select(getSelectedSession)
  if (session.operations) {
    let operationName
    for (const operation of session.operations as any) {
      if (operation.loc.start <= position && operation.loc.end >= position) {
        operationName = operation.name && operation.name.value
      }
    }
    yield call(runQuery, operationName)
  }
}

function* fetchSchemaSaga() {
  const session: SessionProps = yield select(getSelectedSession)
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
  const session: SessionProps = yield select(getSelectedSession)
  const docs: DocsSessionState = yield select(getSelectedSession)
  const schema = yield schemaFetcher.fetch(session)
  const rootMap = getRootMap(schema)
  const stacks = docs.navStack
    .map(stack => getNewStack(rootMap, schema, stack))
    .filter(s => s)
  yield call(setStacks, session.id, stacks)
}

function* addToHistory({ payload }) {
  const { sessionId } = payload
  const workspace = yield select(getSelectedWorkspace)
  const session = workspace.getIn(['sessions', sessionId])

  const history: HistoryState = workspace.get('history')

  const exists = history.toKeyedSeq().find(item => is(item, session))
  if (!exists) {
    yield call(addHistoryItem, session)
  }
}

export default function* sessionsSaga() {
  yield [
    takeLatest('GET_QUERY_FACTS', setQueryFacts),
    takeLatest('SET_OPERATION_NAME', setQueryFacts),
    takeLatest('EDIT_QUERY', setQueryFacts),
    takeLatest('RUN_QUERY_AT_POSITION', runQueryAtPosition),
    takeLatest('FETCH_SCHEMA', fetchSchemaSaga),
    takeLatest('SCHEMA_FETCHING_SUCCESS', renewStacks),
    takeEvery('QUERY_SUCCESS' as any, addToHistory),
  ]
}

// needed to fix typescript
export { ForkEffect }
