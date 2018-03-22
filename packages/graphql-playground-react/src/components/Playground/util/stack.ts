import { isType, GraphQLInterfaceType, GraphQLObjectType } from 'graphql'
import { Map } from 'immutable'

export function getNewStack(root, schema, stack: Map<any, any>) {
  const path = stack.getIn(['field', 'path'])
  const splittedPath = path.split('/')
  let pointer: any = null
  let count = 0
  let lastPointer: any = null
  let y = -1
  while (splittedPath.length > 0) {
    const currentPath: string = splittedPath.shift()!
    if (count === 0) {
      pointer = root[currentPath]
      y = Object.keys(root).indexOf(currentPath)
    } else {
      const argFound = pointer.args.find(arg => arg.name === currentPath)
      lastPointer = pointer
      if (argFound) {
        pointer = argFound
      } else {
        if (pointer.type.ofType) {
          pointer = getDeeperType(pointer.type.ofType)
        }
        if (pointer.type) {
          pointer = pointer.type
        }
        pointer =
          pointer.getFields()[currentPath] ||
          pointer.getInterfaces().find(i => i.name === currentPath)
      }
    }
    if (lastPointer) {
      y = getElementIndex(schema, lastPointer, pointer)
    }
    count++
  }

  if (!pointer) {
    return null
  }

  pointer.path = path
  pointer.parent = lastPointer

  return stack.merge({
    y,
    field: pointer,
  })
}

// Return the deeper type found on object
// For example [[[Company]!]!]! will return only Company
export function getDeeperType(type: any, depth: number = 0): any {
  if (type.ofType && depth < 5) {
    return getDeeperType(type.ofType, depth + 1)
  }
  return type
}

export interface SerializedRoot {
  queries: any[]
  mutations: any[]
  subscriptions: any[]
}

export function getRootMap(schema): any {
  return {
    ...schema.getQueryType().getFields(),
    ...(schema.getMutationType &&
      schema.getMutationType() &&
      schema.getMutationType().getFields()),
    ...(schema.getSubscriptionType &&
      schema.getSubscriptionType() &&
      schema.getSubscriptionType().getFields()),
  }
}

// Serialize schema to get root object
export function serializeRoot(schema): SerializedRoot {
  const obj: SerializedRoot = {
    queries: [],
    mutations: [],
    subscriptions: [],
  }
  const queryType = schema.getQueryType()
  const queryFieldMap = queryType.getFields()
  obj.queries = Object.keys(queryFieldMap).map(fieldName => {
    const field = queryFieldMap[fieldName]
    field.path = fieldName
    field.parent = null
    return field
  })
  const mutationType = schema.getMutationType && schema.getMutationType()
  if (mutationType) {
    const mutationFieldMap = mutationType.getFields()
    obj.mutations = Object.keys(mutationFieldMap).map(fieldName => {
      const field = mutationFieldMap[fieldName]
      field.path = fieldName
      field.parent = null
      return field
    })
  }
  ;(window as any).ss = schema
  const subscriptionType =
    schema.getSubscriptionType && schema.getSubscriptionType()
  if (subscriptionType) {
    const subscriptionFieldMap = subscriptionType.getFields()
    obj.subscriptions = Object.keys(subscriptionFieldMap).map(fieldName => {
      const field = subscriptionFieldMap[fieldName]
      field.path = fieldName
      field.parent = null
      return field
    })
  }
  return obj
}

// Return element that match index on root object
export function getElementRoot(obj: any, index: number) {
  let i = 0
  if (obj.queries[index + i]) {
    return obj.queries[index + i]
  }
  i += obj.queries.length
  if (obj.mutations[index - i]) {
    return obj.mutations[index - i]
  }
  i += obj.mutations.length
  if (obj.subscriptions[index - i]) {
    return obj.subscriptions[index - i]
  }
}

export interface SerializedObj {
  fields: any[]
  interfaces: any[]
  args: any[]
  implementations: any[]
}
// Serialize field
export function serialize(schema, field) {
  const obj: SerializedObj = {
    fields: [],
    interfaces: [],
    args: [],
    implementations: [],
  }
  let type = field.type || field
  const isVarType = isType(type)
  if (type.ofType) {
    type = getDeeperType(type.ofType)
  }
  // Get fields
  if (type.getFields) {
    const fieldMap = type.getFields()
    obj.fields = Object.keys(fieldMap).map(name => {
      const f = fieldMap[name]
      f.parent = field
      f.path = field.path + `/${name}`
      return f
    })
  }
  // Get interfaces
  if (type instanceof GraphQLObjectType) {
    obj.interfaces = type.getInterfaces()
  }
  // Get args
  obj.args = field.args ? field.args : []
  // Get implementations
  if (isVarType && type instanceof GraphQLInterfaceType) {
    obj.implementations = schema.getPossibleTypes(type)
  }
  return obj
}

// Return element that match index on object
export function getElement(obj: any, index: number) {
  let i = 0
  if (obj.interfaces[index + i]) {
    return obj.interfaces[index + i]
  }
  i += obj.interfaces.length
  if (obj.fields[index - i]) {
    return obj.fields[index - i]
  }
  i += obj.fields.length
  if (obj.args[index - i]) {
    return obj.args[index - i]
  }
  i += obj.args.length
  if (obj.implementations[index - i]) {
    return obj.implementations[index - i]
  }
}

export function getElementIndex(schema: any, main: any, element: any) {
  const obj = serialize(schema, main)
  const interfaceIndex = obj.interfaces.indexOf(element)
  if (interfaceIndex > -1) {
    return interfaceIndex
  }

  const fieldsIndex = obj.fields.indexOf(element)
  if (fieldsIndex > -1) {
    return obj.interfaces.length + fieldsIndex
  }

  const argsIndex = obj.args.indexOf(element)
  if (argsIndex > -1) {
    return obj.interfaces.length + obj.fields.length + argsIndex
  }

  const implementationIndex = obj.implementations.indexOf(element)
  if (implementationIndex > -1) {
    return (
      obj.interfaces.length +
      obj.fields.length +
      obj.args.length +
      implementationIndex
    )
  }

  return 0
}
