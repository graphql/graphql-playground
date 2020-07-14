import * as React from 'react'
import TypeLink from './TypeLink'
import { serializeRoot } from '../util/stack'
import { CategoryTitle } from './DocsStyles'
import { styled } from '../../../styled'

export interface Props {
  schema: any
  sessionId: string
}

export default class GraphDocsRoot extends React.PureComponent<Props, {}> {
  render() {
    const { schema, sessionId } = this.props
    const obj = serializeRoot(schema)
    return (
      <DocsRoot className="doc-root">
        <ShowRootType
          name="Queries"
          fields={obj.queries}
          offset={0}
          sessionId={sessionId}
        />
        {obj.mutations.length > 0 && (
          <ShowRootType
            name="Mutations"
            fields={obj.mutations}
            offset={obj.queries.length}
            sessionId={sessionId}
          />
        )}
        {obj.subscriptions.length > 0 && (
          <ShowRootType
            name="Subscriptions"
            fields={obj.subscriptions}
            offset={obj.queries.length + obj.mutations.length}
            sessionId={sessionId}
          />
        )}
      </DocsRoot>
    )
  }
}

interface ShowRootTypeProps {
  name: string
  fields: any[]
  offset: number
  sessionId: string
}

function ShowRootType({ name, fields, offset }: ShowRootTypeProps) {
  const nonDeprecatedFields = fields.filter(data => !data.isDeprecated)
  const deprecatedFields = fields.filter(data => data.isDeprecated)

  return (
    <div>
      <CategoryTitle>{name}</CategoryTitle>
      {nonDeprecatedFields.map((field, index) => (
        <TypeLink
          key={field.name}
          type={field}
          x={0}
          y={offset + index}
          collapsable={true}
          lastActive={false}
        />
      ))}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map((field, index) => (
        <div key={field.name}>
          <DocsValueComment>
            # Deprecated: {field.deprecationReason}
          </DocsValueComment>
          <TypeLink
            type={field}
            x={0}
            y={offset + index + nonDeprecatedFields.length}
            collapsable={true}
            lastActive={false}
          />
        </div>
      ))}
    </div>
  )
}

const DocsRoot = styled.div`
  padding-left: 6px;

  .doc-category-item .field-name {
    color: #f25c54;
  }
`

const DocsValueComment = styled.p`
  color: ${p => p.theme.colours.black50};
  padding-right: 16px;
  padding-left: 16px;
`
