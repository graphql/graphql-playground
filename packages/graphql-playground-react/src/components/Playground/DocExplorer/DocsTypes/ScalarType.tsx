import * as React from 'react'
import DocTypeSchema from './DocType'

export interface ScalarTypeSchemaProps {
  type: any
}

const ScalarTypeSchema = ({ type }: ScalarTypeSchemaProps) => {
  return (
    <DocTypeSchema className="doc-type-schema">
      <span className="field-name">scalar</span>{' '}
      <span className="type-name">{type.name}</span>
    </DocTypeSchema>
  )
}

export default ScalarTypeSchema
