import { GraphQLSchema, introspectionQuery, buildClientSchema } from 'graphql'
import { NoSchemaError } from './util/NoSchemaError'
import { parseHeaders } from './util/parseHeaders'
import { ApolloLink, execute } from 'apollo-link'
import { Map, set } from 'immutable'
import { makeOperation } from './util/makeOperation'

export interface TracingSchemaTuple {
  schema: GraphQLSchema
  tracingSupported: boolean
}

export interface SchemaFetchProps {
  endpoint: string
  headers?: string
}

export type LinkGetter = (session: SchemaFetchProps) => { link: ApolloLink }

export class SchemaFetcher {
  cache: Map<string, TracingSchemaTuple>
  linkGetter: LinkGetter
  fetching: Map<string, Promise<any>>
  constructor(linkGetter: LinkGetter) {
    this.cache = Map()
    this.fetching = Map()
    this.linkGetter = linkGetter
  }
  async fetch(session: SchemaFetchProps) {
    const hash = this.hash(session)
    const cachedSchema = this.cache.get(hash)
    if (cachedSchema) {
      return cachedSchema
    }
    const fetching = this.fetching.get(hash)
    if (fetching) {
      return fetching
    }
    const promise = this.fetchSchema(session)
    this.fetching = this.fetching.set(hash, promise)
    return promise
  }
  refetch(session: SchemaFetchProps) {
    return this.fetchSchema(session)
  }
  hash(session: SchemaFetchProps) {
    return `${session.endpoint}~${session.headers}`
  }
  private fetchSchema(
    session: SchemaFetchProps,
  ): Promise<{ schema: GraphQLSchema; tracingSupported: boolean } | null> {
    const { endpoint } = session
    const headers = JSON.stringify({
      ...parseHeaders(session.headers),
      'X-Apollo-Tracing': '1',
    })

    const { link } = this.linkGetter(set(session, 'headers', headers))

    const operation = makeOperation({ query: introspectionQuery })

    return new Promise((resolve, reject) => {
      execute(link, operation).subscribe({
        next: schemaData => {
          if (schemaData && (schemaData.errors || !schemaData.data)) {
            throw new Error(JSON.stringify(schemaData, null, 2))
          }

          if (!schemaData) {
            throw new NoSchemaError(endpoint)
          }

          const schema = buildClientSchema(schemaData.data as any)
          const tracingSupported =
            (schemaData.extensions && Boolean(schemaData.extensions.tracing)) ||
            false
          const result = {
            schema,
            tracingSupported,
          }
          this.cache = this.cache.set(this.hash(session), result)
          resolve(result)
          this.fetching = this.fetching.remove(this.hash(session))
        },
        error: err => {
          reject(err)
          this.fetching = this.fetching.remove(this.hash(session))
        },
      })
    })
  }
}
