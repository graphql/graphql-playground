import { is } from 'immutable'

export function immutableMemoize(fn) {
  let lastValue
  return arg => {
    const newValue = fn(arg)
    if (!is(lastValue, newValue)) {
      lastValue = newValue
    }
    return lastValue
  }
}
