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
  getSelectedSession,
  getSessionsState,
  getParsedVariablesFromSession,
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
  wsEndpoint?: string,
): { link: ApolloLink; subscriptionClient?: SubscriptionClient } => {
  let connectionParams = {}
  const headers = {
    ...parseHeaders(session.headers),
  }
  if (headers) {
    connectionParams = { ...headers }
  }

  const httpLink = new HttpLink({
    uri: session.endpoint,
    fetch,
    headers,
  })

  if (!(wsEndpoint || subscriptionEndpoint)) {
    return { link: httpLink }
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
  return {
    link: ApolloLink.split(
      operation => isSubscription(operation),
      webSocketLink,
      httpLink,
    ),
    subscriptionClient,
  }
}

let linkCreator = defaultLinkCreator
export let schemaFetcher: SchemaFetcher = new SchemaFetcher(linkCreator)
;(window as any).schemaFetcher = schemaFetcher

export function setLinkCreator(newLinkCreator) {
  if (newLinkCreator) {
    linkCreator = newLinkCreator
    schemaFetcher = new SchemaFetcher(newLinkCreator)
  }
}

const subscriptions = {}

function* runQuerySaga(action) {
  // run the query
  const { operationName } = action
  const session: Session = yield select(getSelectedSession)
  const request = {
    query: session.query,
    operationName,
    variables: getParsedVariablesFromSession(session),
  }
  const operation = makeOperation(request)
  const operationIsSubscription = isSubscription(operation)
  const workspace = yield select(getSelectedWorkspaceId)
  yield put(setSubscriptionActive(isSubscription(operation)))
  yield put(startQuery())
  const { link, subscriptionClient } = linkCreator({
    endpoint: session.endpoint,
    headers: session.headers,
  })

  const channel = eventChannel(emitter => {
    let closed = false
    if (subscriptionClient && operationIsSubscription) {
      subscriptionClient.onDisconnected(() => {
        closed = true
        emitter({
          error: new Error(
            `Could not connect to websocket endpoint ${subscriptionEndpoint}. Please check if the endpoint url is correct.`,
          ),
        })
        emitter(END)
      })
    }
    const subscription = execute(link, operation).subscribe({
      next: function(value) {
        emitter({ value })
      },
      error: error => {
        emitter({ error })
        emitter(END)
      },
      complete: () => {
        emitter(END)
      },
    })

    const unsubscribe = () => {
      if (!closed) {
        try {
          subscription.unsubscribe()
        } catch (e) {
          console.error(e)
        }
      }
    }

    const key = `${workspace}~${session.id}`
    subscriptions[key] = { unsubscribe }

    return unsubscribe
  })

  try {
    while (true) {
      const { value, error } = yield take(channel)
      const response = new ResponseRecord({
        date: JSON.stringify(value ? value : formatError(error), null, 2),
        time: new Date(),
        resultID: cuid(),
      })
      yield put(addResponse(session.id, response))
    }
  } finally {
    yield put(stopQuery(session.id))
  }
}

function formatError(error) {
  if (error instanceof Error) {
    return {
      error: error.message,
    }
  }

  if (typeof error === 'string') {
    return {
      error,
    }
  }

  return error
}

function* stopQuerySaga(action) {
  const { sessionId } = action.payload
  const { sessions } = yield select(getSessionsState)
  const session = sessions.get(sessionId)
  const workspace = yield select(getSelectedWorkspaceId)

  const key = `${workspace}~${session.id}`
  const subscription = subscriptions[key]
  if (subscription && subscription.unsubscribe) {
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
