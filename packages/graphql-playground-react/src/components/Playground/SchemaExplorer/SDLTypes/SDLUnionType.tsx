import SDLType from './SDLType'
import * as React from 'react'
import { DocType } from '../../DocExplorer/DocsTypes/DocType'

export interface EnumTypeSchemaProps {
  schema: any
  type: any
}

const UnionTypeSchema = ({ schema, type }: EnumTypeSchemaProps) => {
  const types = schema.getPossibleTypes(type)
  return (
    <DocType className="doc-type-schema">
      <span className="field-name">union</span>{' '}
      <span className="type-name">{type.name}</span>
      {' = '}
      {types.map(value => <SDLType key={value.name} type={value} />)}
    </DocType>
  )
}

export default UnionTypeSchema
