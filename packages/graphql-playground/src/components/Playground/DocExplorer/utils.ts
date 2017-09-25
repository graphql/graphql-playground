import { isType, GraphQLInterfaceType, GraphQLObjectType } from 'graphql'

// Return the deeper type found on object
// For example [[[Company]!]!]! will return only Company
export function getDeeperType(type: any, depth: number = 0): any {
  if (type.ofType && depth < 3) {
    return getDeeperType(type.ofType, depth + 1)
  }
  return type
}

export interface SerializedRoot {
  queries: any[]
  mutations: any[]
  subscriptions: any[]
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
  const subscriptionType =
    schema.getSubscriptionType && schema.getSubscriptionType()
  if (subscriptionType) {
    const subscriptionFieldMap = mutationType.getFields()
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
