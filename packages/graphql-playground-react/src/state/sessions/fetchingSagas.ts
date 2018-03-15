import { ApolloLink, execute } from 'apollo-link'
import { SessionProps } from '../../types'
import { parseHeaders } from '../../components/Playground/util/parseHeaders'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { isSubscription } from '../../components/Playground/util/hasSubscription'
import { takeLatest, ForkEffect, call, select } from 'redux-saga/effects'
import { makeOperation } from '../../components/Playground/util/makeOperation'
import {
  setSubscriptionActive,
  stopQuery,
  startQuery,
  addResponse,
} from './actions'
import {
  getParsedVariables,
  getSelectedSession,
  getSessionsState,
} from './selectors'
import {
  SchemaFetcher,
  SchemaFetchProps,
} from '../../components/Playground/SchemaFetcher'
import { getSelectedWorkspace } from '../workspace/reducers'

// tslint:disable

export const defaultLinkCreator = (
  session: SchemaFetchProps,
  extraHeaders?: any,
  wsEndpoint?: string,
): ApolloLink => {
  let connectionParams = {}
  const headers = {
    ...parseHeaders(session.headers),
    ...extraHeaders,
  }
  if (session.headers) {
    connectionParams = { ...headers }
  }

  const httpLink = new HttpLink({
    uri: session.endpoint,
    fetch,
    headers,
  })

  if (!wsEndpoint) {
    return httpLink
  }

  const subscriptionClient = new SubscriptionClient(wsEndpoint!, {
    timeout: 20000,
    connectionParams,
  })

  const webSocketLink = new WebSocketLink(subscriptionClient)
  return ApolloLink.split(
    operation => isSubscription(operation),
    webSocketLink,
    httpLink,
  )
}

let linkCreator = defaultLinkCreator
export let schemaFetcher: SchemaFetcher = new SchemaFetcher(linkCreator)

export function setLinkCreator(newLinkCreator) {
  if (newLinkCreator) {
    linkCreator = newLinkCreator
    schemaFetcher = new SchemaFetcher(newLinkCreator)
  }
}

const subscriptions = {}

function* runQuerySaga(action) {
  // run the query
  console.log(`runQuery`, action)
  const { operationName } = action
  const session: SessionProps = yield select(getSelectedSession)
  const request = {
    query: session.query,
    operationName,
    variables: getParsedVariables,
  }
  const operation = makeOperation(request)
  const workspace = yield select(getSelectedWorkspace)
  yield call(setSubscriptionActive, isSubscription(operation))
  yield call(startQuery)
  const link = linkCreator({
    headers: session.headers || '',
    endpoint: session.endpoint,
  })
  subscriptions[`${workspace}~${session.id}`] = execute(
    link,
    operation,
  ).subscribe({
    next: value => {
      console.log('value', value)
      call(addResponse, value)
    },
    error: e => {
      console.log('error', e)
      call(stopQuery)
    },
    complete: () => {
      call(stopQuery)
    },
  })
}

function* stopQuerySaga(action) {
  const { sessionId } = action.payload
  const sessions = yield select(getSessionsState)
  const session = sessions.get(sessionId)
  const workspace = yield select(getSelectedWorkspace)

  const subscription = subscriptions[`${workspace}~${session.id}`]
  if (subscription && subscription.unsubscribe) {
    subscription.unsubscribe()
  }
  delete subscriptions[`${workspace}~${session.id}`]
}

export const fecthingSagas = [
  takeLatest('RUN_QUERY', runQuerySaga),
  takeLatest('STOP_QUERY', stopQuerySaga),
]

// needed to fix typescript
export { ForkEffect }
