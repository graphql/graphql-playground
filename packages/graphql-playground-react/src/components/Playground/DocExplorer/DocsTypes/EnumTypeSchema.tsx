import * as React from 'react'
import { styled } from '../../../../styled'
import { DocType } from './DocType'

export interface EnumTypeSchemaProps {
  type: any
  sdlType?: boolean
}

const EnumTypeSchema = ({ type, sdlType }: EnumTypeSchemaProps) => {
  const values = sdlType ? type._values : type.getValues()
  const deprecatedValues = values.filter((value: any) => value.isDeprecated)
  return (
    <DocType className="doc-type-schema">
      <span className="field-name">enum</span>{' '}
      <span className="type-name">{type.name}</span>{' '}
      <span className="brace">{'{'}</span>
      {values
        .filter((value: any) => !value.isDeprecated)
        .map((value, index) => (
          <Value key={value.name} first={index === 0} value={value} />
        ))}
      {deprecatedValues.length > 0 && <br />}
      {deprecatedValues.map((value, index) => (
        <Value
          first={index === 0}
          key={value.name}
          value={value}
          isDeprecated={true}
        />
      ))}
      <span className="brace">{'}'}</span>
    </DocType>
  )
}

export default EnumTypeSchema

interface ValueProps {
  value: any
  isDeprecated?: boolean
  first: boolean
}

const Value = ({ value, isDeprecated, first }: ValueProps) => (
  <DocsValue first={first}>
    <div className="field-name">{value.name}</div>
    {value.description && (
      <DocsValueComment>{value.description}</DocsValueComment>
    )}
    {isDeprecated && (
      <DocsValueComment>Deprecated: {value.deprecationReason}</DocsValueComment>
    )}
  </DocsValue>
)

interface DocsValueProps {
  first: boolean
}

const DocsValue = styled<DocsValueProps, 'div'>('div')`
  margin-top: ${p => (p.first ? 0 : 6)}px;
  .field-name {
    padding: 0 16px;
    color: red;
  }
`

const DocsValueComment = styled.div`
  padding: 0 16px;
  color: ${p => p.theme.colours.black50};
`
