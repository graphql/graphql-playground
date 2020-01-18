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
  return (
    <div>
      <CategoryTitle>{name}</CategoryTitle>
      {fields
        .filter(field => !field.isDeprecated)
        .map((field, index) => (
          <TypeLink
            key={field.name}
            type={field}
            x={0}
            y={offset + index}
            collapsable={true}
            lastActive={false}
          />
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
