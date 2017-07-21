import * as React from 'react'
import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'
import TypeLink from './TypeLink'
import ScalarTypeSchema from './DocsTypes/ScalarType'
import EnumTypeSchema from './DocsTypes/EnumTypeSchema'
import UnionTypeSchema from './DocsTypes/UnionTypeSchema'

interface Props {
  schema: any
  type: any
  level: number
}

const getNode = (type: any): any => {
  if (type.ofType) {
    return getNode(type.ofType)
  }
  return type
}

export default class TypeDetails extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps) {
    return this.props.type !== nextProps.type
  }

  render() {
    const { schema, level } = this.props
    let { type } = this.props
    if (type.ofType) {
      type = getNode(type.ofType)
    }
    return (
      <div>
        <style jsx={true} global={true}>{`
          .doc-description {
            @p: .ph16, .black50;
          }
        `}</style>
        <div className="doc-category-title">
          {'type details'}
        </div>
        <MarkdownContent
          className="doc-description"
          markdown={type.description || 'No Description'}
        />
        <DocTypeSchema type={type} level={level} />
        {type instanceof GraphQLScalarType && <ScalarTypeSchema type={type} />}
        {type instanceof GraphQLEnumType && <EnumTypeSchema type={type} />}
        {type instanceof GraphQLUnionType &&
          <UnionTypeSchema type={type} schema={schema} />}
      </div>
    )
  }
}

interface DocTypeSchemaProps {
  type: any
  level: number
}

const DocTypeSchema = ({ type, level }: DocTypeSchemaProps) => {
  if (!type.getFields) {
    return null
  }
  const fieldMap = type.getFields()
  const fields = Object.keys(fieldMap).map(name => fieldMap[name])
  const deprecatedFields = fields.filter(data => data.isDeprecated)
  let interfaces: any[] = []
  if (type instanceof GraphQLObjectType) {
    interfaces = type.getInterfaces()
  }
  return (
    <div className="doc-type-schema">
      <style jsx={true} global={true}>{`
        .doc-type-schema .doc-category-item {
          padding-left: 32px;
        }
      `}</style>
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .pt20;
        }
        .doc-type-schema-line {
          @p: .ph16, .pv6;
        }
        .doc-value-comment {
          @p: .pr16, .black50;
          padding-left: 32px;
        }
        .doc-type-interface {
          @p: .pl16;
        }
      `}</style>
      <div className="doc-type-schema-line">
        <span className="field-name">type</span>{' '}
        <span className="type-name">{type.name}</span>{' '}
        {interfaces.length === 0 &&
          <span className="type-name">
            {'{'}
          </span>}
      </div>
      {interfaces.map((data, index) =>
        <TypeLink
          key={data.name}
          type={data}
          level={level}
          className="doc-type-interface"
          beforeNode={<span className="field-name">implements</span>}
          // Only show curly bracket on last interface
          afterNode={
            index === interfaces.length - 1
              ? <span className="type-name">
                  {'{'}
                </span>
              : null
          }
        />,
      )}
      {fields
        .filter(data => !data.isDeprecated)
        .map(data => <TypeLink key={data.name} type={data} level={level} />)}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map(data =>
        <div key={data.name}>
          <span className="doc-value-comment">
            # Deprecated: {data.deprecationReason}
          </span>
          <TypeLink type={data} level={level} />
        </div>,
      )}
      <div className="doc-type-schema-line">
        <span className="type-name">
          {'}'}
        </span>
      </div>
    </div>
  )
}
