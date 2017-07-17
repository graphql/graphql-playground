import { parse } from 'graphql'

const isQuerySubscription = (
  query: string,
  operationName: string | null,
): boolean => {
  let ast: any = null
  // takes around 0.02ms -  1ms
  try {
    ast = parse(query)
  } catch (e) {
    //
  }

  let isSubscription = false

  if (ast) {
    ast.definitions.forEach(definition => {
      if (definition.operation === 'subscription') {
        // tslint:disable-next-line
        if (operationName && operationName.length > 0) {
          isSubscription = definition.name.value === operationName
        } else {
          isSubscription = true
        }
      }
    })
  }

  return isSubscription
}

export default isQuerySubscription
