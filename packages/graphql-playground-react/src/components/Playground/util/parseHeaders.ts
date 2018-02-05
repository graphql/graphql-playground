export function parseHeaders(headers?: string) {
  if (!headers) {
    return {}
  }
  if (Array.isArray(headers)) {
    return headers.reduce((acc, header) => {
      return {
        ...acc,
        [header.name]: header.value,
      }
    }, {})
  } else if (typeof headers === 'object') {
    return headers
  }
  let jsonVariables

  try {
    jsonVariables =
      headers && headers.trim() !== '' ? JSON.parse(headers) : undefined
  } catch (error) {
    /* tslint:disable-next-line */
    console.error(`Headers are invalid JSON: ${error.message}.`)
  }

  if (typeof jsonVariables !== 'object') {
    /* tslint:disable-next-line */
    console.error('Headers are not a JSON object.')
  }

  return jsonVariables
}
