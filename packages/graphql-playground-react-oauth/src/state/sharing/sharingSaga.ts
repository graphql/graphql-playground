import { takeEvery, ForkEffect, select, put } from 'redux-saga/effects'
import { getEndpoint } from '../sessions/selectors'
import { setShareUrl } from './actions'
import * as cuid from 'cuid'
import { getSharingState } from './selectors'
import { Map } from 'immutable'
import { safely } from '../../utils'

function* share() {
  const state = yield makeSharingState()
  const endpoint = yield select(getEndpoint)
  const res = yield fetch('https://api.graphqlbin.com/', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation ($session: String! $endpoint: String!) {
          addSession(session: $session endpoint: $endpoint) {
            id
          }
        }
      `,
      variables: {
        session: JSON.stringify(state),
        endpoint,
      },
    }),
  }).then(data => data.json())

  const shareUrl = `https://graphqlbin.com/v2/${res.data.addSession.id}`
  yield put(setShareUrl(shareUrl))
}

function* makeSharingState() {
  let state = yield select()
  const sharing = yield select(getSharingState)

  const id = cuid()
  state = state
    .update('workspaces', w =>
      w.filter((workspace, key) => key === state.selectedWorkspace),
    )
    .set('selectedWorkspace', `${id}~${state.selectedWorkspace}`)
    .update('workspaces', w => w.mapKeys(k => `${id}~${k}`))

  const selectedSessionId = state.workspaces.get(state.selectedWorkspace)
    .sessions.selectedSessionId

  if (!sharing.allTabs) {
    state = state
      .updateIn(
        ['workspaces', state.selectedWorkspace, 'sessions', 'sessions'],
        sessions => sessions.filter((value, key) => key === selectedSessionId),
      )
      .setIn(
        ['workspaces', state.selectedWorkspace, 'sessions', 'sessionCount'],
        1,
      )
  }

  if (!sharing.headers) {
    state = state.updateIn(
      ['workspaces', state.selectedWorkspace, 'sessions', 'sessions'],
      sessions => sessions.map(session => session.set('headers', '')),
    )
  }

  if (!sharing.history) {
    state = state.setIn(
      ['workspaces', state.selectedWorkspace, 'history'],
      Map(),
    )
  }

  return state
}

export const sharingSagas = [takeEvery('SHARE', safely(share))]

// needed to fix typescript
export { ForkEffect }
