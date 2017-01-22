import { parse } from 'graphql'
import {QueryTypes} from '../../types'

const getQueryTypes = (query: string): QueryTypes => {
  let ast: any = null
  // takes around 0.02ms -  1ms
  try {
    ast = parse(query)
  } catch (e) {}

  let hasSubscription = false
  let hasQuery = false
  let hasMutation = false
  let firstOperationName = null

  if (ast) {
    ast.definitions.forEach(definition => {
      if (!firstOperationName) {
        firstOperationName = definition.selectionSet &&
          definition.selectionSet.selections &&
          definition.selectionSet.selections.length > 0 &&
          definition.selectionSet.selections[0].name.value
      }
      if (definition.operation === 'subscription') {
        hasSubscription = true
      }
      if (definition.operation === 'query') {
        hasQuery = true
      }
      if (definition.operation === 'mutation') {
        hasMutation = true
      }
    })
  }

  return {
    firstOperationName,
    subscription: hasSubscription,
    query: hasQuery,
    mutation: hasMutation,
  }
}

export default getQueryTypes
