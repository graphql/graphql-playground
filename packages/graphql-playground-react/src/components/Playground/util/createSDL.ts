import {
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  GraphQLSchema,
  printSchema,
} from 'graphql'
import { serialize } from './stack'
import { prettify } from '../../../utils'
// import { getRootMap } from './stack'

interface Options {
  commentDescriptions?: boolean
}

const defaultTypes = [
  '__Schema',
  '__Directive',
  '__DirectiveLocation',
  '__Type',
  '__Field',
  '__InputValue',
  '__EnumValue',
  '__TypeKind',
  'String',
  'ID',
  'Boolean',
  'Int',
  'Float',
]

/* Creates an array of SchemaTypes for the SDLFieldDocs 
(A component that is similar to the DocsExplorer) to consume */
export function sdlArray(schema: GraphQLSchema, options?: Options) {
  const objectValues =
    Object.values || (obj => Object.keys(obj).map(key => obj[key]))
  const typeMap = schema.getTypeMap()
  const types = objectValues(typeMap)
    .sort((type1, type2) => type1.name.localeCompare(type2.name))
    .filter(type => !defaultTypes.includes(type.name))
    .map(type => ({
      ...type,
      ...serialize(schema, type),
      instanceOf: getTypeInstance(type),
    }))
  return types
}

function getTypeInstance(type) {
  if (type instanceof GraphQLInterfaceType) {
    return 'interface'
  } else if (type instanceof GraphQLUnionType) {
    return 'union'
  } else if (type instanceof GraphQLEnumType) {
    return 'enum'
  } else if (type instanceof GraphQLInputObjectType) {
    return 'input'
  } else {
    return 'type'
  }
}

// Adds Line Breaks to Schema View
function addLineBreaks(sdl: string, commentsDisabled: boolean = true) {
  const noNewLines = sdl.replace(/^\s*$(?:\r\n?|\n)/gm, '')
  // Line Break all Brackets
  const breakBrackets = noNewLines.replace(/[}]/gm, '$&\r\n')
  // Line Break all Scalars
  const withLineBreaks = breakBrackets.replace(/(?:scalar )\w+/g, '$&\r\n')

  if (commentsDisabled) {
    return withLineBreaks
  }
  // Special Line Breaking for Comments
  const withCommentLineBreaks = withLineBreaks.replace(
    /(?:\#[\w\'\s\r\n\*](.*)$)/gm,
    '$&\r',
  )
  return withCommentLineBreaks
}

// Returns a prettified schema
export function getSDL(
  schema: GraphQLSchema | null | undefined,
  commentsDisabled: boolean = true,
) {
  if (schema instanceof GraphQLSchema) {
    const rawSdl = printSchema(schema, { commentDescriptions: true })
    if (commentsDisabled) {
      // Removes Comments but still has new lines
      const sdlWithNewLines = rawSdl.replace(/(\#[\w\'\s\r\n\*](.*)$)/gm, '')
      // Removes newlines left behind by Comments
      const sdlWithoutComments = prettify(sdlWithNewLines, 80)
      return addLineBreaks(sdlWithoutComments, commentsDisabled)
    }
    const sdl = prettify(rawSdl, 80)
    return addLineBreaks(sdl)
  }
  return ''
}

// Downloads the schema in either .json or .graphql format
export function downloadSchema(schema: GraphQLSchema, type: string) {
  if (type === 'sdl') {
    const data = getSDL(schema, false)
    const filename = 'schema.graphql'
    return download(data, filename)
  } else {
    const data = JSON.stringify(schema)
    const filename = 'instrospectionSchema.json'
    return download(data, filename)
  }
}

// Performant option for downloading files
function download(data: any, filename: string, mime?: string) {
  const blob = new Blob([data], { type: mime || 'application/octet-stream' })
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const blobURL = window.URL.createObjectURL(blob)
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', filename)
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    window.URL.revokeObjectURL(blobURL)
  }
}
