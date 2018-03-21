import { ApolloLink, execute } from 'apollo-link'
import { parseHeaders } from '../../components/Playground/util/parseHeaders'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { isSubscription } from '../../components/Playground/util/hasSubscription'
import {
  takeLatest,
  ForkEffect,
  put,
  select,
  takeEvery,
  take,
} from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
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
import { getSelectedWorkspaceId } from '../workspace/reducers'
import * as cuid from 'cuid'
import { Session, ResponseRecord } from './reducers'

// tslint:disable
let subscriptionEndpoint = ''

export function setSubscriptionEndpoint(endpoint) {
  subscriptionEndpoint = endpoint
}

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

  if (!(wsEndpoint || subscriptionEndpoint)) {
    return httpLink
  }

  const subscriptionClient = new SubscriptionClient(
    wsEndpoint || subscriptionEndpoint,
    {
      timeout: 20000,
      lazy: true,
      connectionParams,
    },
  )

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
    console.log('setting link creator', newLinkCreator)
    linkCreator = newLinkCreator
    schemaFetcher = new SchemaFetcher(newLinkCreator)
  }
}

const subscriptions = {}

function* runQuerySaga(action) {
  // run the query
  console.log(`runQuery`, action)
  const { operationName } = action
  const session: Session = yield select(getSelectedSession)
  const request = {
    query: session.query,
    operationName,
    variables: getParsedVariables,
  }
  const operation = makeOperation(request)
  const workspace = yield select(getSelectedWorkspaceId)
  yield put(setSubscriptionActive(isSubscription(operation)))
  yield put(startQuery())
  const link = linkCreator({
    headers: session.headers || '',
    endpoint: session.endpoint,
  })

  const channel = eventChannel(emitter => {
    const subscription = execute(link, operation).subscribe({
      next: function(value) {
        console.log('next', value)
        emitter({ value })
      },
      error: error => {
        console.log('error', error)
        emitter({ error })
        emitter(END)
      },
      complete: () => {
        console.log('complete')
        emitter(END)
      },
    })

    const key = `${workspace}~${session.id}`
    console.log({ key })
    subscriptions[key] = subscription

    return () => {
      subscription.unsubscribe()
    }
  })

  try {
    while (true) {
      const { value, error } = yield take(channel)
      if (value) {
        const response = new ResponseRecord({
          date: JSON.stringify(value, null, 2),
          time: new Date(),
          resultID: cuid(),
        })
        yield put(addResponse(session.id, response))
      } else {
        yield put(addResponse(session.id, error))
      }
    }
  } finally {
    yield put(stopQuery(session.id))
  }
}

function* stopQuerySaga(action) {
  const { sessionId } = action.payload
  const { sessions } = yield select(getSessionsState)
  const session = sessions.get(sessionId)
  const workspace = yield select(getSelectedWorkspaceId)

  const key = `${workspace}~${session.id}`
  console.log({ key })
  const subscription = subscriptions[key]
  console.log({ subscription })
  if (subscription && subscription.unsubscribe) {
    console.log('unsubscribing')
    subscription.unsubscribe()
  }
  delete subscriptions[key]
}

export const fecthingSagas = [
  takeEvery('RUN_QUERY', runQuerySaga),
  takeLatest('STOP_QUERY', stopQuerySaga),
]

// needed to fix typescript
export { ForkEffect }
