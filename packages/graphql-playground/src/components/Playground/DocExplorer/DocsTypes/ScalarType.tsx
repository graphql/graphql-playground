import * as React from 'react'

export interface ScalarTypeSchemaProps {
  type: any
}

const ScalarTypeSchema = ({ type }: ScalarTypeSchemaProps) => {
  return (
    <div className="doc-type-schema">
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .ph16, .pt20;
        }
      `}</style>
      <span className="field-name">scalar</span>{' '}
      <span className="type-name">{type.name}</span>
    </div>
  )
}

export default ScalarTypeSchema
