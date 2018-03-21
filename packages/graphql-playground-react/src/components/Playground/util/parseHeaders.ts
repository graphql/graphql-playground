export function parseHeaders(headers?: string) {
  if (!headers) {
    return {}
  }
  try {
    return JSON.parse(headers)
  } catch (e) {
    return {}
  }
}
