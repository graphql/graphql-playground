import { ApolloLink, execute } from 'apollo-link'
import { parseHeaders } from '../../components/Playground/util/parseHeaders'
import { HttpLink } from 'apollo-link-http'
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
  setResponseExtensions,
  setCurrentQueryStartTime,
  setCurrentQueryEndTime,
  setEndpointUnreachable,
  clearResponses,
  setResponse,
} from './actions'
import {
  getSelectedSession,
  getSessionsState,
  getParsedVariablesFromSession,
} from './selectors'
import { SchemaFetcher } from '../../components/Playground/SchemaFetcher'
import { getSelectedWorkspaceId, getSettings } from '../workspace/reducers'
import * as cuid from 'cuid'
import { Session, ResponseRecord } from './reducers'
import { addHistoryItem } from '../history/actions'
import { safely } from '../../utils'
import { set } from 'immutable'
import { SubscriptionClient as SubscriptionClientSTWS } from 'subscriptions-transport-ws'
import { WebSocketLink as WebSocketLinkALW } from 'apollo-link-ws'
import { createClient as createSubscriptionClient, Client as SubscriptionClientGWS } from 'graphql-ws'
import { WebSocketLink as WebSocketLinkGW } from './WebSocketLink'

// tslint:disable
let subscriptionEndpoint

export function setSubscriptionEndpoint(endpoint) {
  subscriptionEndpoint = endpoint
}

export interface LinkCreatorProps {
  endpoint: string
  headers?: Headers
  credentials?: string
  subscriptionTransport?: string
}

export interface Headers {
  [key: string]: string | number | null
}

const isWSEndpoint = (endpoint: string): boolean => !!endpoint.match(/wss?/);

export const defaultLinkCreator = (
  session: LinkCreatorProps,
  subscriptionEndpoint?: string,
): { link: ApolloLink; subscriptionClient?: SubscriptionClientGWS | SubscriptionClientSTWS } => {
  
  let connectionParams = {}
  const { headers, credentials, subscriptionTransport } = session

  if (headers) {
    connectionParams = { ...headers }
  }

  const httpLink = new HttpLink({
    uri: session.endpoint,
    headers,
    credentials,
  })

  // ws endpoint => graphql-ws default link
  if (isWSEndpoint(session.endpoint)) {
    const subscriptionClient = createSubscriptionClient({
      retryAttempts: 1000,
      retryWait: () => new Promise(resolve => setTimeout(resolve, 20000)),
      lazy: true,
      connectionParams,
      url: session.endpoint,
    })

    return {
      link: new WebSocketLinkGW(subscriptionClient),
      subscriptionClient,
    }
  } 

  // http endpoint & graphql-ws => default link = http + graphql-ws subscriptions
  if (subscriptionTransport === 'graphql-ws') {
    const subscriptionClient = createSubscriptionClient({
      retryWait: () => new Promise(resolve => setTimeout(resolve, 20000)),
      lazy: true,
      connectionParams,
      url: subscriptionEndpoint || session.endpoint.replace('http', 'ws'),
    })
  
    return {
      subscriptionClient,
      link: new WebSocketLinkGW(subscriptionClient)
    }
  }

  // http endpoint => default link = http + subscriptions-transport-ws subscriptions
  const subscriptionClient = new SubscriptionClientSTWS(
    subscriptionEndpoint || session.endpoint.replace('http', 'ws'),
    {
      timeout: 20000,
      lazy: true,
      connectionParams,
    }
  )

  const webSocketLink = new WebSocketLinkALW(subscriptionClient);

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

const isSubscriptionClientSTWS = (
  client: SubscriptionClientGWS | SubscriptionClientSTWS
  ): client is SubscriptionClientSTWS => {
  return !!(client as SubscriptionClientSTWS).onDisconnected
}

function* runQuerySaga(action) {
  // run the query
  const { operationName } = action.payload
  const selectedWorkspaceId = yield select(getSelectedWorkspaceId)
  const session: Session = yield select(getSelectedSession)
  const request = {
    query: session.query,
    operationName,
    variables: getParsedVariablesFromSession(session),
  }
  const operation = makeOperation(request)
  const operationIsSubscription = isSubscription(operation)
  const workspace = yield select(getSelectedWorkspaceId)
  const settings = yield select(getSettings)
  yield put(setSubscriptionActive(isSubscription(operation)))
  yield put(startQuery())
  let headers = parseHeaders(session.headers)
  if (session.tracingSupported && session.responseTracingOpen) {
    headers = set(headers, 'X-Apollo-Tracing', '1')
  }
  
  const lol = {
    endpoint: session.endpoint,
    headers: {
      ...settings['request.globalHeaders'],
      ...headers,
    },
    subscriptionTransport: settings['subscriptions.protocol'],
    credentials: settings['request.credentials'],
  }

  const { link, subscriptionClient } = linkCreator(lol, subscriptionEndpoint)
  yield put(setCurrentQueryStartTime(new Date()))

  let firstResponse = false
  const channel = eventChannel(emitter => {
    let closed = false
    if (subscriptionClient && operationIsSubscription) {
      const onDisconnect = () => {
        closed = true
        emitter({
          error: new Error(
            `Could not connect to websocket endpoint ${subscriptionEndpoint}. Please check if the endpoint url is correct.`,
          ),
        })
        emitter(END)
      }
      if (isSubscriptionClientSTWS(subscriptionClient)) {
        subscriptionClient.onDisconnected(onDisconnect)
      } else {
        subscriptionClient.on('closed', onDisconnect)
      }
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
      if (value && value.extensions) {
        const extensions = value.extensions
        yield put(setResponseExtensions(extensions))
        if (
          value.extensions.tracing &&
          settings['tracing.hideTracingResponse']
        ) {
          delete value.extensions.tracing
        }
      }
      const response = new ResponseRecord({
        date: JSON.stringify(value ? value : formatError(error), null, 2),
        time: new Date(),
        resultID: cuid(),
      })
      const errorMessage = extractMessage(error)
      if (errorMessage === 'Failed to fetch') {
        yield put(setEndpointUnreachable(session.endpoint))
      }
      if (operationIsSubscription) {
        if (firstResponse) {
          yield put(clearResponses())
          firstResponse = false
        }
        yield put(addResponse(selectedWorkspaceId, session.id, response))
      } else {
        yield put(setResponse(selectedWorkspaceId, session.id, response))
      }
      yield put(addHistoryItem(session))
    }
  } finally {
    yield put(setCurrentQueryEndTime(new Date()))
    yield put(stopQuery(session.id, selectedWorkspaceId))
  }
}

export function formatError(error, fetchingSchema: boolean = false) {
  const message = extractMessage(error)
  if (message === 'Failed to fetch') {
    const schemaMessage = fetchingSchema ? ' schema' : ''
    return { error: `${message}${schemaMessage}. Please check your connection` }
  }

  try {
    const ee = JSON.parse(message)
    return ee
  } catch (e) {
    //
  }

  return { error: message }
}

function extractMessage(error) {
  if (error instanceof Error) {
    // Errors from apollo-link-http may include a "result" object, which is a JSON response from
    // the server. We should surface that to the client
    if (!!error['result'] && typeof error['result'] === 'object') {
      return (error as any).result
    }
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return error
}

function* stopQuerySaga(action) {
  const { sessionId, workspaceId } = action.payload
  const { sessions } = yield select(getSessionsState)
  const session = sessions.get(sessionId)
  const workspace = yield workspaceId || select(getSelectedWorkspaceId)

  const key = `${workspace}~${session.id}`
  const subscription = subscriptions[key]
  if (subscription && subscription.unsubscribe) {
    subscription.unsubscribe()
  }
  delete subscriptions[key]
}

export const fecthingSagas = [
  takeEvery('RUN_QUERY', safely(runQuerySaga)),
  takeLatest('STOP_QUERY', safely(stopQuerySaga)),
]

// needed to fix typescript
export { ForkEffect }
