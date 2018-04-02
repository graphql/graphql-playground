import { memoize } from 'lodash'
const fibonacci = memoize(num => {
  if (num <= 1) {
    return 1
  }

  return fibonacci(num - 1) + fibonacci(num - 2)
})

export class Backoff {
  cb
  count = 1
  running = true
  timeout
  maxRetries = 20
  constructor(cb) {
    this.cb = cb
  }
  async start() {
    const fn = async () => {
      await this.cb()
      this.count++
      if (this.running && this.count < this.maxRetries) {
        setTimeout(
          fn,
          (this.count < 15 ? 3 : fibonacci(this.count - 12)) * 1000,
        )
      }
    }
    fn()
  }
  stop() {
    this.running = false
    clearTimeout(this.timeout)
  }
}
