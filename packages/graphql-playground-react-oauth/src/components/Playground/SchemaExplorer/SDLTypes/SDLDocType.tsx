import * as React from 'react'
import SDLType from './SDLType'
import { styled } from '../../../../styled'

export interface DocTypeSchemaProps {
  type: any
  fields: any[]
  interfaces: any[]
}

export default ({ type, fields, interfaces }: DocTypeSchemaProps) => {
  const nonDeprecatedFields = fields.filter(data => !data.isDeprecated)
  const deprecatedFields = fields.filter(data => data.isDeprecated)
  return (
    <DocTypeSchema>
      <DocTypeLine>
        <span className="field-name">{type.instanceOf}</span>{' '}
        <DocsTypeName>{type.name}</DocsTypeName>{' '}
        {interfaces.length === 0 && <Brace>{`{`}</Brace>}
      </DocTypeLine>
      {interfaces.map((data, index) => (
        <DocsTypeInferface
          key={data.name}
          type={data}
          beforeNode={<span className="field-name">implements</span>}
          afterNode={
            index === interfaces.length - 1 ? <Brace>{'{'}</Brace> : null
          }
        />
      ))}
      {nonDeprecatedFields.map(data => (
        <SDLType key={data.name} type={data} collapsable={true} />
      ))}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map((data, index) => (
        <div key={data.name}>
          <DocsValueComment>
            # Deprecated: {data.deprecationReason}
          </DocsValueComment>
          <SDLType type={data} />
        </div>
      ))}
      <DocTypeLine>
        <Brace>{'}'}</Brace>
      </DocTypeLine>
    </DocTypeSchema>
  )
}

const DocTypeSchema = styled.div`
  font-size: 14px;
  flex: 1;
  .doc-category-item {
    padding-left: 32px;
  }
`

const DocTypeLine = styled.div`
  padding: 6px 16px;
  white-space: nowrap;
`

const DocsTypeName = styled.span`
  color: #f25c54;
`

const DocsTypeInferface = styled(SDLType)`
  padding-left: 16px;
  .field-name {
    color: rgb(245, 160, 0);
  }
  .type-name {
    color: #f25c54;
  }
`

const DocsValueComment = styled.span`
  color: ${p => p.theme.colours.black50};
  padding-right: 16px;
  padding-left: 32px;
`

const Brace = styled.span`
  font-weight: 600;
  color: ${p => p.theme.colours.darkBlue50};
`
