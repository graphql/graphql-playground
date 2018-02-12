import { Operation } from 'apollo-link'
import { OperationDefinitionNode } from 'graphql'

export function isSubscription(operation: Operation): boolean {
  const selectedOperation = getSelectedOperation(operation)
  if (selectedOperation) {
    return selectedOperation.operation === 'subscription'
  }
  return false
}

function getSelectedOperation(
  operation: Operation,
): OperationDefinitionNode | undefined {
  if (operation.query.definitions.length === 1) {
    return operation.query.definitions[0] as OperationDefinitionNode
  }

  return operation.query.definitions.find(
    d =>
      d.kind === 'OperationDefinition' &&
      !!d.name &&
      d.name.value === operation.operationName,
  ) as OperationDefinitionNode
}
