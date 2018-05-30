let last: number | null = null
// tslint:disable
export function log(...messages) {
  if (messages.length === 0) {
    last = null
  }
  if (last) {
    console.log(...messages, `${performance.now() - last}ms`)
  } else {
    console.log(...messages)
  }
  last = performance.now()
}
