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

// tslint:disable
let subscriptionEndpoint

export function setSubscriptionEndpoint(endpoint) {
  subscriptionEndpoint = endpoint
}

export interface LinkCreatorProps {
  endpoint: string
  headers?: Headers
  credentials?: string
}

export interface Headers {
  [key: string]: string | number | null
}

export const defaultLinkCreator = (
  session: LinkCreatorProps,
  subscriptionEndpoint?: string,
): { link: ApolloLink; subscriptionClient?: SubscriptionClient } => {
  let connectionParams = {}
  const { headers, credentials } = session

  if (headers) {
    connectionParams = { ...headers }
  }

  const httpLink = new HttpLink({
    uri: session.endpoint,
    headers,
    credentials,
  })

  if (!subscriptionEndpoint) {
    return { link: httpLink }
  }

  const subscriptionClient = new SubscriptionClient(subscriptionEndpoint, {
    timeout: 20000,
    lazy: true,
    connectionParams,
  })

  const webSocketLink = new WebSocketLink(subscriptionClient)
  return {
    link: ApolloLink.split(
      operation => isSubscription(operation),
      webSocketLink as any,
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
    headers,
    credentials: settings['request.credentials'],
  }

  const { link, subscriptionClient } = linkCreator(lol, subscriptionEndpoint)
  yield put(setCurrentQueryStartTime(new Date()))

  let firstResponse = false
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
