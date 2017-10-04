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
          @p: .ph16, .pt20, .overflowAuto, .f14;
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
      <span className="brace">{'{'}</span>
      {values
        .filter((value: any) => !value.isDeprecated)
        .map((value, index) => <Value key={value.name} first={index === 0} value={value} />)}
      {deprecatedValues.length > 0 && <br />}
      {deprecatedValues.map(value =>
        <Value key={value.name} value={value} isDeprecated={true} />,
      )}
      <span className="brace">{'}'}</span>
    </div>
  )
}

export default EnumTypeSchema

interface ValueProps {
  value: any
  isDeprecated?: boolean
  first: boolean
}

const Value = ({ value, isDeprecated, first }: ValueProps) =>
  <div className="doc-value">
    <style jsx={true}>{`
      .doc-value .field-name {
        @p: .ph16;
      }
      .field-name {
        padding-top: 6px;
      }
      .field-name--first {
        padding-top: 0px;
      }
      .doc-value-comment {
        @p: .ph16, .black50;
      }
    `}</style>
    <div className={`field-name${first ? ' field-name--first' : ''}`}>
      {value.name}
    </div>
    {value.description &&
      <div className="doc-value-comment">
        # {value.description}
      </div>}
    {isDeprecated &&
      <div className="doc-value-comment">
        # Deprecated: {value.deprecationReason}
      </div>}
  </div>
