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

export default class TypeDetails extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps) {
    return this.props.type !== nextProps.type
  }

  render() {
    const { schema, level } = this.props
    let { type } = this.props
    // TODO find a better way to do that
    if (type instanceof GraphQLNonNull) {
      type = type.ofType
    }
    if (type instanceof GraphQLList) {
      type = type.ofType
    }
    if (type instanceof GraphQLNonNull) {
      type = type.ofType
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
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .pt20;
        }
        .doc-type-schema-line {
          @p: .ph10, .pv6;
        }
        .doc-value-comment {
          @p: .ph20, .black50;
        }
      `}</style>
      <div className="doc-type-schema-line">
        <span className="field-name">type</span>{' '}
        <span className="type-name">{type.name}</span>{' '}
        {interfaces.length > 0 &&
          interfaces.map(data =>
            <span key={data.name} className="doc-type-interface">
              <br />
              <span className="field-name">implements</span>{' '}
              <span className="type-name">{data.name}</span>{' '}
            </span>,
          )}
        <span className="type-name">{'{'}</span>
      </div>
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
      <span className="type-name">
        {'}'}
      </span>
    </div>
  )
}
