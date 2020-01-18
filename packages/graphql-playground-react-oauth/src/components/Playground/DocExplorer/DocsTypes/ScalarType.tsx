import * as React from 'react'
import { DocType } from './DocType'

export interface ScalarTypeSchemaProps {
  type: any
}

const ScalarTypeSchema = ({ type }: ScalarTypeSchemaProps) => {
  return (
    <DocType className="doc-type-schema">
      <span className="field-name">scalar</span>{' '}
      <span className="type-name">{type.name}</span>
    </DocType>
  )
}

export default ScalarTypeSchema
