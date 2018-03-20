import {
  takeLatest,
  ForkEffect,
  call,
  select,
  takeEvery,
  put,
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { getSelectedSession } from './selectors'
import getSelectedOperationName from '../../components/Playground/util/getSelectedOperationName'
import { getQueryFacts } from '../../components/Playground/util/getQueryFacts'
import { fromJS, is } from 'immutable'
import {
  setVariableToType,
  setOperations,
  setOperationName,
  schemaFetchingSuccess,
  schemaFetchingError,
  fetchSchema,
  runQuery,
  setTracingSupported,
} from './actions'
import { getRootMap, getNewStack } from '../../components/Playground/util/stack'
import { DocsSessionState } from '../docs/reducers'
import { setStacks } from '../docs/actions'
import { HistoryState } from '../history/reducers'
import { addHistoryItem } from '../history/actions'
import { SessionProps } from '../../types'
import { schemaFetcher } from './fetchingSagas'
import { getSelectedWorkspace } from '../workspace/reducers'
import { getSessionDocsState } from '../docs/selectors'

function* setQueryFacts() {
  // debounce by 150 ms
  yield call(delay, 150)
  const session: SessionProps = yield select(getSelectedSession)

  const schema = yield schemaFetcher.fetch(session)
  const queryFacts = getQueryFacts(schema, session.query)

  if (queryFacts) {
    const immutableQueryFacts = fromJS(queryFacts)
    const operationName = getSelectedOperationName(
      session.operations,
      session.operationName,
      immutableQueryFacts.operations,
    )
    if (!is(immutableQueryFacts.variableToType, session.variableToType)) {
      // set variableToType
      yield put(setVariableToType(immutableQueryFacts.variableToType))
    }
    if (!is(immutableQueryFacts.operations, session.operations)) {
      // set operations
      yield put(setOperations(immutableQueryFacts.operations))
    }
    if (operationName !== session.operationName) {
      yield put(setOperationName(operationName))
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
    if (operationName) {
      yield put(runQuery(operationName))
    } else {
      yield put(runQuery())
    }
  } else {
    yield put(runQuery())
  }
}

function* fetchSchemaSaga() {
  const session: SessionProps = yield select(getSelectedSession)
  yield schemaFetcher.refetch(session)
  try {
    yield put(schemaFetchingSuccess())
  } catch (e) {
    yield put(schemaFetchingError())
    yield call(delay, 5000)
    yield put(fetchSchema())
  }
}

function* renewStacks() {
  const session: SessionProps = yield select(getSelectedSession)
  const docs: DocsSessionState = yield select(getSessionDocsState)
  const { schema, tracingSupported } = yield schemaFetcher.fetch(session)
  const rootMap = getRootMap(schema)
  const stacks = docs.navStack
    .map(stack => getNewStack(rootMap, schema, stack))
    .filter(s => s)
  yield put(setStacks(session.id, stacks))
  yield put(setTracingSupported(tracingSupported))
}

function* addToHistory({ payload }) {
  const { sessionId } = payload
  const workspace = yield select(getSelectedWorkspace)
  const session = workspace.getIn(['sessions', sessionId])

  const history: HistoryState = workspace.get('history')

  const exists = history.toKeyedSeq().find(item => is(item, session))
  if (!exists) {
    yield put(addHistoryItem(session))
  }
}

export const sessionsSagas = [
  takeLatest('GET_QUERY_FACTS', setQueryFacts),
  takeLatest('SET_OPERATION_NAME', setQueryFacts),
  takeLatest('EDIT_QUERY', setQueryFacts),
  takeEvery('RUN_QUERY_AT_POSITION', runQueryAtPosition),
  takeLatest('FETCH_SCHEMA', fetchSchemaSaga),
  takeLatest('SCHEMA_FETCHING_SUCCESS', renewStacks),
  takeEvery('QUERY_SUCCESS' as any, addToHistory),
]

// needed to fix typescript
export { ForkEffect }
