import * as React from 'react'
import TypeLink from './TypeLink'

export interface Props {
  schema: any
}

const GraphDocsRoot = ({ schema }: Props) => {
  const mutationType = schema.getMutationType && schema.getMutationType()
  const subscriptionType =
    schema.getSubscriptionType && schema.getSubscriptionType()
  return (
    <div>
      <ShowRootType name="Queries" type={schema.getQueryType()} />
      {mutationType && <ShowRootType name="Mutations" type={mutationType} />}
      {subscriptionType &&
        <ShowRootType name="Subscriptions" type={subscriptionType} />}
    </div>
  )
}

interface ShowRootTypeProps {
  name: string
  type: any
}

function ShowRootType({ name, type }: ShowRootTypeProps) {
  const fieldMap = type.getFields()
  const fields = Object.keys(fieldMap).map(fieldName => fieldMap[fieldName])
  return (
    <div>
      <div className="doc-category-title">
        {name}
      </div>
      {fields
        .filter(field => !field.isDeprecated)
        .map(field => <TypeLink key={field.name} type={field} level={0} />)}
    </div>
  )
}

export default GraphDocsRoot
