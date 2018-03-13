import { GraphQLSchema, introspectionQuery, buildClientSchema } from 'graphql'
import { NoSchemaError } from './util/NoSchemaError'
import { Session } from '../../types'
import { parseHeaders } from './util/parseHeaders'
import { ApolloLink, execute } from 'apollo-link'
import { setIn } from 'immutable'
import { makeOperation } from './util/makeOperation'

export interface TracingSchemaTuple {
  schema: GraphQLSchema
  tracingSupported: boolean
}

export type LinkGetter = (session: Session) => ApolloLink

export class SchemaFetcher {
  cache: Map<string, TracingSchemaTuple>
  linkGetter: LinkGetter
  constructor(linkGetter: LinkGetter) {
    this.cache = new Map()
    this.linkGetter = linkGetter
  }
  async fetch(session: Session) {
    const cachedSchema = this.cache.get(this.hash(session))
    return cachedSchema || this.fetchSchema(session)
  }
  refetch(session: Session) {
    return this.fetchSchema(session)
  }
  hash(session: Session) {
    const { endpoint, headers } = session
    return `${endpoint}~${headers}`
  }
  private fetchSchema(
    session: Session,
  ): Promise<{ schema: GraphQLSchema; tracingSupported: boolean } | null> {
    const { endpoint } = session
    const headers = {
      ...parseHeaders(session.headers),
      'X-Apollo-Tracing': '1',
    }

    const newSession = setIn<Session>(session, ['headers'], headers)

    const link = this.linkGetter(newSession)

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
          this.cache.set(this.hash(session), result)
          resolve(result)
        },
        error: err => {
          reject(JSON.stringify(err, null, 2))
        },
      })
    })
  }
}
