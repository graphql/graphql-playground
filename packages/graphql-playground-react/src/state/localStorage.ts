import { debounce } from 'lodash'
import { deserializePersistedState } from './workspace/deserialize'

export function serializeState(store) {
  return debounce(
    () => {
      const state = store.getState()
      if (!state.stateInjected) {
        localStorage.setItem('graphql-playground', JSON.stringify(state))
      }
    },
    300,
    { trailing: true },
  ) as any
}

export function deserializeState() {
  try {
    // let before = performance.now()
    const state = localStorage.getItem('graphql-playground')
    if (state) {
      // console.log(
      //   `Needed ${performance.now() - before}ms to get ${
      //     state.length
      //   } bytes from localstorage`,
      // )
      // before = performance.now()
      const json = JSON.parse(state)
      // console.log(`Needed ${performance.now() - before}ms to parse state`)
      // before = performance.now()
      const result = deserializePersistedState(json) as any
      // console.log(
      //   `Needed ${performance.now() - before}ms to deserialize the parsed json`,
      // )
      return result
    }
  } catch (e) {
    //
  }
  return undefined
}
