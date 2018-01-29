import { DocumentNode } from 'graphql'

const isSubscription = definition =>
  definition.kind === 'OperationDefinition' &&
  definition.operation === 'subscription'

const hasSubscription = (query: DocumentNode): boolean =>
  query.definitions.some(isSubscription)

export default hasSubscription
