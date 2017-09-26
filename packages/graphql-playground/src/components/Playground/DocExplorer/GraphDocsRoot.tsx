import * as React from 'react'
import TypeLink from './TypeLink'
import { serializeRoot } from './utils'

export interface Props {
  schema: any
  onSetWidth: (width: number) => void
}

export default class GraphDocsRoot extends React.PureComponent<Props, {}> {
  render() {
    const { schema, onSetWidth } = this.props
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
          onSetWidth={onSetWidth}
        />
        {obj.mutations.length > 0 &&
          <ShowRootType
            name="Mutations"
            fields={obj.mutations}
            offset={obj.queries.length}
            onSetWidth={onSetWidth}
          />}
        {obj.subscriptions.length > 0 &&
          <ShowRootType
            name="Subscriptions"
            fields={obj.subscriptions}
            offset={obj.queries.length + obj.mutations.length}
            onSetWidth={onSetWidth}
          />}
      </div>
    )
  }
}

interface ShowRootTypeProps {
  name: string
  fields: any[]
  offset: number
  onSetWidth: (width: number) => void
}

function ShowRootType({ name, fields, offset, onSetWidth }: ShowRootTypeProps) {
  return (
    <div>
      <div className="doc-category-title">
        {name}
      </div>
      {fields
        .filter(field => !field.isDeprecated)
        .map((field, index) =>
          <TypeLink
            key={field.name}
            type={field}
            x={0}
            y={offset + index}
            onSetWidth={onSetWidth}
          />,
        )}
    </div>
  )
}
