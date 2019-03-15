import { GraphQLInterfaceType } from 'graphql'
import * as React from 'react'
import TypeLink from './TypeLink'
import { styled } from '../../../styled'

export interface DocTypeSchemaProps {
  type: any
  fields: any[]
  interfaces: any[]
  level: number
  sessionId: string
}

export default ({ type, fields, interfaces, level }: DocTypeSchemaProps) => {
  const nonDeprecatedFields = fields.filter(data => !data.isDeprecated)
  const deprecatedFields = fields.filter(data => data.isDeprecated)

  const typeInstance =
    type instanceof GraphQLInterfaceType ? 'interface ' : 'type'

  return (
    <DocTypeSchema>
      <DocTypeLine>
        <span className="field-name">{typeInstance}</span>{' '}
        <DocsTypeName>{type.name}</DocsTypeName>{' '}
        {interfaces.length === 0 && <Brace>{`{`}</Brace>}
      </DocTypeLine>
      {interfaces.map((data, index) => (
        <DocsTypeInferface
          key={data.name}
          type={data}
          x={level}
          y={index}
          collapsable={true}
          beforeNode={<span className="field-name">implements</span>}
          afterNode={
            index === interfaces.length - 1 ? <Brace>{'{'}</Brace> : null
          }
          lastActive={false}
        />
      ))}
      {nonDeprecatedFields.map((data, index) => (
        <TypeLink
          key={data.name}
          type={data}
          x={level}
          y={index + interfaces.length}
          collapsable={true}
          lastActive={false}
        />
      ))}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map((data, index) => (
        <div key={data.name}>
          <DocsValueComment>
            # Deprecated: {data.deprecationReason}
          </DocsValueComment>
          <TypeLink
            type={data}
            x={level}
            y={index + nonDeprecatedFields.length + interfaces.length}
            collapsable={true}
            lastActive={false}
          />
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
  overflow: auto;
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

const DocsTypeInferface = styled(TypeLink)`
  padding-left: 16px;
  .field-name {
    color: rgb(245, 160, 0);
  }
  .type-name {
    color: #f25c54;
  }
`

const DocsValueComment = styled.p`
  color: ${p => p.theme.colours.black50};
  padding-right: 16px;
  padding-left: 32px;
`

const Brace = styled.span`
  font-weight: 600;
  color: ${p => p.theme.colours.darkBlue50};
`
