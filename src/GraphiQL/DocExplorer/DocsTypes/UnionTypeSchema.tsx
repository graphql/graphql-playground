import * as React from 'react'

export interface EnumTypeSchemaProps {
  schema: any
  type: any
}

const UnionTypeSchema = ({ schema, type }: EnumTypeSchemaProps) => {
  const types = schema.getPossibleTypes(type)
  return (
    <div className="doc-type-schema">
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .ph16, .pt20;
        }
        .doc-value {
          @p: .ph16;
        }
      `}</style>
      <span className="field-name">union</span>{' '}
      <span className="type-name">{type.name}</span>
      {' = '}
      {types.map((value, index) =>
        <div key={value.name} className="doc-value">
          <span className="type-name">{value.name}</span>{' '}
          {index < types.length - 1 && <span>|</span>}
        </div>,
      )}
    </div>
  )
}

export default UnionTypeSchema
