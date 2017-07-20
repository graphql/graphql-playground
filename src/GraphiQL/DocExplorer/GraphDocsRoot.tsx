import * as React from 'react'
import TypeLink from './TypeLink'

interface Props {
  schema: any
  onClickType: (field: any, level: number) => void
}

const GraphDocsRoot = ({ schema, onClickType }: Props) => {
  const type = schema.getQueryType()
  const fieldMap = type.getFields()
  const fields = Object.keys(fieldMap).map(name => fieldMap[name])
  const mutationType = schema.getMutationType && schema.getMutationType()
  const subscriptionType =
    schema.getSubscriptionType && schema.getSubscriptionType()
  return (
    <div>
      <ShowRootType
        name="Queries"
        type={schema.getQueryType()}
        onClickType={onClickType}
      />
      {mutationType &&
        <ShowRootType
          name="Mutations"
          type={mutationType}
          onClickType={onClickType}
        />}
      {subscriptionType &&
        <ShowRootType
          name="Subscriptions"
          type={subscriptionType}
          onClickType={onClickType}
        />}
    </div>
  )
}

interface ShowRootTypeProps {
  name: string
  type: any
  onClickType: (field: any, level: number) => void
}

function ShowRootType({ name, type, onClickType }: ShowRootTypeProps) {
  const fieldMap = type.getFields()
  const fields = Object.keys(fieldMap).map(fieldName => fieldMap[fieldName])
  return (
    <div>
      <div className="doc-category-title">
        {name}
      </div>
      {fields
        .filter(field => !field.isDeprecated)
        .map(field =>
          <TypeLink
            key={field.name}
            type={field}
            onClick={data => onClickType(data, 0)}
          />,
        )}
    </div>
  )
}

export default GraphDocsRoot
