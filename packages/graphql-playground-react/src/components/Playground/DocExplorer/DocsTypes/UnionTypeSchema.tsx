import TypeLink from '../TypeLink'
import * as React from 'react'

export interface EnumTypeSchemaProps {
  schema: any
  type: any
  level: number
  sessionId: string
}

const UnionTypeSchema = ({
  schema,
  type,
  level,
  sessionId,
}: EnumTypeSchemaProps) => {
  const types = schema.getPossibleTypes(type)
  return (
    <div className="doc-type-schema">
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .ph16, .pt20, .overflowAuto, .f14;
        }
        .doc-value {
          @p: .ph16;
        }
      `}</style>
      <span className="field-name">union</span>{' '}
      <span className="type-name">{type.name}</span>
      {' = '}
      {types.map((value, index) => (
        <TypeLink
          key={value.name}
          type={value}
          x={level}
          y={index + 1}
          collapsable={true}
          sessionId={sessionId}
          lastActive={false}
        />
      ))}
    </div>
  )
}

export default UnionTypeSchema
