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
  constructor(linkGetter: LinkGetter) {
    this.cache = Map()
    this.linkGetter = linkGetter
  }
  async fetch(session: SchemaFetchProps) {
    const hash = this.hash(session)
    const cachedSchema = this.cache.get(hash)
    return cachedSchema || this.fetchSchema(session)
  }
  refetch(session: SchemaFetchProps) {
    return this.fetchSchema(session)
  }
  hash(session: SchemaFetchProps) {
    const { endpoint, headers } = session
    return `${endpoint}~${headers}`
  }
  private fetchSchema(
    session: SchemaFetchProps,
  ): Promise<{ schema: GraphQLSchema; tracingSupported: boolean } | null> {
    const { endpoint } = session
    const headers = JSON.stringify({
      ...parseHeaders(session.headers),
      'X-Apollo-Tracing': '1',
    })

    // const newSession = setIn<SchemaFetchProps>(session, ['headers'], headers)

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
          /**
           * DANGER! THIS IS AN EXTREME HACK. As soon, as codemirror-graphql doesn't use getType in .hint anymore
           * this can be removed.
           */
          const oldGetType = schema.getType
          schema.getType = type => {
            const getTypeResult = oldGetType.call(schema, type)
            return getTypeResult || type
          }
          const tracingSupported =
            (schemaData.extensions && Boolean(schemaData.extensions.tracing)) ||
            false
          const result = {
            schema,
            tracingSupported,
          }
          this.cache = this.cache.set(this.hash(session), result)
          resolve(result)
        },
        error: err => {
          reject(JSON.stringify(err, null, 2))
        },
      })
    })
  }
}
