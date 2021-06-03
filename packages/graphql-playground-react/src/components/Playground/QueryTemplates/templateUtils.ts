export interface IQueryTemplate {
  title: string
  description: string
  query: string
}

const ignoredFields = ['createdAt', 'updatedAt', 'deletedAt', 'createdById', 'updatedById', 'deletedById', 'version']


export const allPropsMarker = '#allProps#'
const indent = ' '.repeat(2) // extra spaces in query line start to be removed
const formatRegex = new RegExp(`^${indent.repeat(2)}`, 'gm')

export function formatQuery(template: IQueryTemplate): IQueryTemplate {
  return {
    ...template,
    query: template.query.replace(formatRegex, '') + "\n"
  }
}

export function fillPropsToQuery(schema: any, query: string): string {
  const usedQueryName = query.match(/query *\{[\s]*([a-zA-z]+)/)[1]

  /*
  const schemaQuery = schema.queries.find(item => item.name === usedQuery)
  // const fields = findQueryFields(schemaQuery, usedQuery)
  const fields = findQueryFields(schemaQuery)

  const concatedProps = Object.entries(fields).reduce((acc, [key, value]: [string, {name: string}]) => {
    /*
    const content = isEntity(schema, fields, value.name)
      ? expandEntityProps(value.name)
      : value.name
    * /

    // tslint:disable-next-line:no-console
    console.log(value, '- ', content, createPluralName(content))
    // return acc + indent.repeat(2) + value.name + ",\n"
    return acc + indent.repeat(2) + content + ",\n"
  }, "\n")
  */

  const schemaQuery = schema.queries.find(item => item.name === usedQueryName)
  const concatedProps = myFieldRecursion(schemaQuery)

  const result = query.replace(allPropsMarker, concatedProps)

  return result
}




function myFieldRecursion(schemaPart: any, objsSoFar = []): string {
  const subType = findQuerySubType(schemaPart.type)
  const tmpResult = myRealRecursionForType(subType)

  // tslint:disable-next-line:no-console
  console.log('value', tmpResult)

  // const result = tmpResult.join(', ')
  const result = tmpResult

  return result
}


function myRealRecursionForType(subType, objsSoFar = []): string {
  // tslint:disable-next-line:no-console
  console.log('subType', subType)

  const fields = subType._fields

  const concatedProps = Object.entries(fields).reduce((acc, [key, value]: [string, {name: string, type: any}]) => {
    if (ignoredFields.includes(value.name)) {
      return acc
    }

    const tmpIndent = indent.repeat(2 + objsSoFar.length)

    if (!value.type) {
      return acc + tmpIndent + value.name + ",\n"
    }

    const innerType = findQuerySubType(value.type)
    // tslint:disable-next-line:no-console
    console.log('innerType', innerType)

    if (objsSoFar.includes(innerType)) {
      // return acc + '#recursionStop#' // recursion stop
      return acc // recursion stop
    }

    if (innerType._fields) {
      return acc + `${tmpIndent}${value.name} {${myRealRecursionForType(innerType, [...objsSoFar, subType])}${tmpIndent}},\n`
    }

    return acc + tmpIndent + value.name + ",\n"
  }, "\n")

  return concatedProps
}

function findQuerySubType(schemaPart: any): Record<string, any> {
  let tmp = schemaPart
  while (!tmp._fields) {
    if (!tmp.type && !tmp.ofType) {
      return {}
    }

    tmp = tmp.type || tmp.ofType
  }

  return tmp
}


/*
const maxIter = 10

function myFieldRecursion(schemaPart: any, iter = 0, objsSoFar = []) {
  if (iter >= maxIter) {
    return null
  }

  const fields = findQueryFields(schemaPart)

  const concatedProps = Object.entries(fields).reduce((acc, [key, value]: [string, {name: string}]) => {
    if (objsSoFar.includes(value)) {
      return acc + 'dadada'
    }

    // tslint:disable-next-line:no-console
    // console.log('value', value)

    const innerFields = myFieldRecursion(value, iter++, [...objsSoFar, value])

    // tslint:disable-next-line:no-console
    console.log('innerFields', value.name, typeof innerFields, innerFields)

    const content = innerFields && Object.keys(innerFields).length
      // ? 'xx' + innerFields + 'xx'
      ? 'xx' + Object.entries(innerFields).map(([tmpKey, tmpValue]: [string, {name: string}]) => tmpValue.name).join(', ') + 'xx'
      // : value.name
      : value.name

    // tslint:disable-next-line:no-console
    // console.log('cccons', key, value, content)

    // const content = 'tmp'

    return acc + indent.repeat(2) + content + ",\n"
  }, "\n")

// const concatedProps = 'tralala'
// tslint:disable-next-line:no-console
console.log('result', fields)
// console.log('result', concatedProps)


  return concatedProps
}
*/

/*
function isEntity(schema: any, queryFields: Record<string, any>, fieldName: string): boolean {

  // const sameNameQueryExists = Object.entries(schema).find(([key]) => key === fieldName)
  const sameNameQueryExists = Object.entries(schema.queries).find(([key, value]: [string, {name: string}]) => {
    const fieldPluralName = createPluralName(fieldName)
    // tslint:disable-next-line:no-console
    // console.log('trala', key, value.name, fieldPluralName)

    // return key === fieldName
    return value.name === fieldPluralName
  })

  // const tmp = findQueryFields(schema, fieldName)

  // tslint:disable-next-line:no-console
  console.log('isEntity', sameNameQueryExists, schema, queryFields, fieldName)

  // const tmp = findQueryFields(schema)
  const tmp = findQueryFields(queryFields[fieldName])

  // tslint:disable-next-line:no-console
  console.log('tmp', tmp)

  if (tmp && Object.keys(tmp).length) {
    return true
  }


  // if (tmp) {
  // if (1) {
  // if (sameNameQueryExists) {
  //   return true
  // }

  return false
}

function expandEntityProps(fieldName: string): string {
  return `-x ${fieldName} x-`
}

*/
/*
// function findQueryFields(schemaPart: any, queryName: string): Record<string, any> {
  // let tmp = schemaPart.type
function findQueryFields(schemaPart: any): Record<string, any> {
  let tmp = schemaPart.type
  while (!tmp._fields) {
    if (!tmp.type && !tmp.ofType) {
      return {}
    }

    tmp = tmp.type || tmp.ofType
  }

  return tmp._fields
}
*/
/*
// naive implementation for converting singular to plural from
function createPluralName(name: string): string {
  if (name[name.length - 1] === 'y') {
    return name.substr(0, name.length - 1) + 'ies'
  }

  return name + 's'
}
*/
