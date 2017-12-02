import * as React from 'react'
import TypeLink from './TypeLink'
import { serializeRoot } from '../util/stack'

export interface Props {
  schema: any
  sessionId: string
}

export default class GraphDocsRoot extends React.PureComponent<Props, {}> {
  render() {
    const { schema, sessionId } = this.props
    const obj = serializeRoot(schema)
    return (
      <div className="doc-root">
        <style jsx={true}>{`
          .doc-root {
            padding-left: 6px;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .doc-root .doc-category-item .field-name {
            color: #f25c54;
          }
        `}</style>
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
      </div>
    )
  }
}

interface ShowRootTypeProps {
  name: string
  fields: any[]
  offset: number
  sessionId: string
}

function ShowRootType({ name, fields, offset, sessionId }: ShowRootTypeProps) {
  return (
    <div>
      <div className="doc-category-title">{name}</div>
      {fields
        .filter(field => !field.isDeprecated)
        .map((field, index) => (
          <TypeLink
            key={field.name}
            type={field}
            x={0}
            y={offset + index}
            sessionId={sessionId}
            collapsable={true}
          />
        ))}
    </div>
  )
}
