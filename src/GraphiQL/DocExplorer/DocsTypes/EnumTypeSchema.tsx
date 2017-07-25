import * as React from 'react'

export interface EnumTypeSchemaProps {
  type: any
}

const EnumTypeSchema = ({ type }: EnumTypeSchemaProps) => {
  const values = type.getValues()
  const deprecatedValues = values.filter((value: any) => value.isDeprecated)
  return (
    <div className="doc-type-schema">
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .ph16, .pt20;
        }
        .doc-value .field-name {
          @p: .ph16;
        }
        .doc-value-comment {
          @p: .ph16, .black50;
        }
      `}</style>
      <span className="field-name">enum</span>{' '}
      <span className="type-name">{type.name}</span>{' '}
      <span className="type-name">{'{'}</span>
      {values
        .filter((value: any) => !value.isDeprecated)
        .map(value => <Value key={value.name} value={value} />)}
      {deprecatedValues.length > 0 && <br />}
      {deprecatedValues.map(value =>
        <Value key={value.name} value={value} isDeprecated={true} />,
      )}
      <span className="type-name">{'}'}</span>
    </div>
  )
}

export default EnumTypeSchema

interface ValueProps {
  value: any
  isDeprecated?: boolean
}

const Value = ({ value, isDeprecated }: ValueProps) =>
  <div className="doc-value">
    <style jsx={true}>{`
      .doc-value .field-name {
        @p: .ph16;
      }
      .doc-value-comment {
        @p: .ph16, .black50;
      }
    `}</style>
    {value.description &&
      <div className="doc-value-comment">
        # {value.description}
      </div>}
    {isDeprecated &&
      <div className="doc-value-comment">
        # Deprecated: {value.deprecationReason}
      </div>}
    <div className="field-name">
      {value.name}
    </div>
  </div>
