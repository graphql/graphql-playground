import { GraphQLClient, Environment } from '../../types'

export class CodeGenerator {
  private client: GraphQLClient
  private environment: Environment
  private endpointUrl: string

  constructor(
    client: GraphQLClient,
    environment: Environment,
    endpointUrl: string,
  ) {
    this.client = client
    this.environment = environment
    this.endpointUrl = endpointUrl
  }

  getSetup() {
    const template = `$ npm install `

    if (this.client === 'graphql-request') {
      return template + `graphql-request`
    } else if (this.client === 'fetch') {
      return template + `isomorphic-fetch es6-promise`
    }

    return ''
  }

  getCode(query: string) {
    if (this.environment === 'Cli') {
      return this.getTransport() + this.getQueryCode(query)
    } else if (this.client === 'fetch') {
      return this.getImports() + '\n' + this.getQueryCode(query)
    }

    return (
      this.getImports() +
      '\n\n' +
      this.getTransport() +
      '\n\n' +
      this.getQueryCode(query)
    )
  }

  private getTransport() {
    if (this.client === 'graphql-request' && this.environment !== 'Cli') {
      return `const client = new GraphQLClient('${this.endpointUrl}', {
  headers: {
    Authorization: 'Bearer YOUR_AUTH_TOKEN',
  },
});
`
    } else if (this.environment === 'Cli') {
      return `curl '${this.endpointUrl}' \ 
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \ 
  `
    }
    return ''
  }

  private getImports() {
    if (this.client === 'graphql-request' && this.environment === 'Node') {
      return `const GraphQLClient = require('graphql-request').GraphQLClient`
    } else if (
      this.client === 'graphql-request' &&
      this.environment === 'Browser'
    ) {
      return `import { GraphQLClient } from 'graphql-request'`
    } else if (this.client === 'fetch') {
      return `require('es6-promise').polyfill()
require('isomorphic-fetch')
      `
    }
    return ''
  }

  private getQueryCode(query: string) {
    if (query.includes('mutation')) {
      return this.getMutation(query)
    } else {
      return this.getQuery(query)
    }
  }

  private getQuery(query: string) {
    if (this.client === 'graphql-request') {
      const curlyIndex = query.indexOf('{')

      const strippedQuery = query.slice(curlyIndex, query.length)
      if (this.client === 'graphql-request') {
        return `function getItem() {
  return client.request(\`
${strippedQuery.split('\n').map(line => '    ' + line).join('\n')}
  \`)
}`
      }
    }

    if (this.client === 'fetch') {
      return `function getItems() { 
  ${this.getFetchBody(query)}
}`
    }

    if (this.client === 'curl') {
      return `-d '{"query":"${JSON.stringify(query.replace(/\s/g, ''))}"}'`
    }

    return ''
  }

  private getFetchBody(query: string) {
    const clearString = query.replace(/\s/g, '')

    const jsonQuery = JSON.stringify({
      query: clearString,
    })

    return (
      `return fetch('${this.endpointUrl}', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    //'Authorization': 'Bearer YOUR_AUTH_TOKEN'
    },
    body: '` +
      `${jsonQuery}` +
      `', 
  })`
    )
  }

  private getMutation(query: string) {
    const curlyIndex = query.indexOf('{')

    const strippedQuery = query.slice(curlyIndex, query.length)
    if (this.client === 'graphql-request') {
      return `function setItem() {
  return client.request(\`
${strippedQuery.split('\n').map(line => '    ' + line).join('\n')}
  \`)
}`
    }

    if (this.client === 'fetch') {
      return `function setItem() { 
  ${this.getFetchBody(query)} 
}`
    }

    if (this.client === 'curl') {
      return `-d '{"query":${JSON.stringify(query.replace(/\s/g, ''))}}'`
    }

    return ''
  }
}
