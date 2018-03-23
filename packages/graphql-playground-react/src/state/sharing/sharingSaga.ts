import { takeEvery, ForkEffect, select, put } from 'redux-saga/effects'
import { getEndpoint } from '../sessions/selectors'
import { setShareUrl } from './actions'
import * as cuid from 'cuid'

function* share() {
  //
  const state = yield makeSharingState()
  const endpoint = yield select(getEndpoint)
  const res = yield fetch(
    'https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2',
    {
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
    },
  ).then(data => data.json())
  const shareUrl = `https://graphqlbin.com/v2/${res.data.addSession.id}`
  yield put(setShareUrl(shareUrl))
}

function* makeSharingState() {
  let state = yield select()

  const id = cuid()
  state = state
    .update('workspaces', w =>
      w.filter((workspace, key) => key === state.selectedWorkspace),
    )
    .set('selectedWorkspace', `${id}~${state.selectedWorkspace}`)
    .update('workspaces', w => w.mapKeys(k => `${id}~${k}`))

  return state
}

export const sharingSagas = [takeEvery('SHARE', share)]

// needed to fix typescript
export { ForkEffect }
