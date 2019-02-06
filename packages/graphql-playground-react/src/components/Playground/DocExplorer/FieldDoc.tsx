import * as React from 'react'
import Argument from './Argument'
import {
  GraphQLInterfaceType,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLScalarType,
} from 'graphql'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'
import TypeLink from './TypeLink'
import DocTypeSchema from './DocTypeSchema'
import ScalarTypeSchema from './DocsTypes/ScalarType'
import EnumTypeSchema from './DocsTypes/EnumTypeSchema'
import UnionTypeSchema from './DocsTypes/UnionTypeSchema'
import { getDeeperType, serialize } from '../util/stack'
import { CategoryTitle } from './DocsStyles'
import { styled } from '../../../styled'

export interface Props {
  schema: any
  field: any
  level: number
  sessionId: string
}

export interface State {
  showDeprecated: boolean
}

export default class FieldDoc extends React.Component<Props, State> {
  state = { showDeprecated: false }
  ref

  componentDidMount() {
    this.scrollToRight()
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.field !== nextProps.field) {
      this.scrollToRight()
      return true
    }
    return false
  }

  scrollToRight() {
    const explorer = this.ref
    const explorerDoc: any =
      explorer.parentNode && explorer.parentNode.parentNode
    // TODO see browser compatibility scrollWidth && scrollLeft
    scrollToRight(explorerDoc, explorerDoc.scrollWidth, 50)
  }

  setRef = ref => {
    this.ref = ref
  }

  render() {
    const { schema, field, level } = this.props
    let type = field.type || field
    const obj = serialize(schema, field)
    type = getDeeperType(type)
    const argsOffset = obj.fields.length + obj.interfaces.length
    const implementationsOffset =
      obj.fields.length + obj.interfaces.length + obj.args.length

    let typeInstance

    if (type instanceof GraphQLInterfaceType) {
      typeInstance = 'interface'
    } else if (type instanceof GraphQLUnionType) {
      typeInstance = 'union'
    } else if (type instanceof GraphQLEnumType) {
      typeInstance = 'enum'
    } else {
      typeInstance = 'type'
    }

    return (
      <div ref={this.setRef}>
        <DocsHeader>
          <TypeLink
            type={field}
            x={level}
            y={-1}
            clickable={false}
            lastActive={false}
          />
        </DocsHeader>
        <DocsDescription
          className="doc-type-description"
          markdown={field.description || ''}
        />

        <CategoryTitle>{`${typeInstance} details`}</CategoryTitle>
        {type.description &&
          type.description.length > 0 && (
            <DocsDescription markdown={type.description || ''} />
          )}
        {type instanceof GraphQLScalarType && <ScalarTypeSchema type={type} />}
        {type instanceof GraphQLEnumType && <EnumTypeSchema type={type} />}
        {type instanceof GraphQLUnionType && (
          <UnionTypeSchema
            type={type}
            schema={schema}
            level={level}
            sessionId={this.props.sessionId}
          />
        )}

        {obj.fields &&
          obj.fields.length > 0 && (
            <DocTypeSchema
              type={type}
              fields={obj.fields}
              interfaces={obj.interfaces}
              level={level}
              sessionId={this.props.sessionId}
            />
          )}

        {obj.args &&
          obj.args.length > 0 && (
            <div>
              <CategoryTitle>arguments</CategoryTitle>
              {obj.args.map((arg, index) => (
                <div key={arg.name}>
                  <div>
                    <Argument
                      arg={arg}
                      x={level}
                      y={index + argsOffset}
                      sessionId={this.props.sessionId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        {obj.implementations &&
          obj.implementations.length > 0 && (
            <div>
              <CategoryTitle>implementations</CategoryTitle>
              {obj.implementations.map((data, index) => (
                <TypeLink
                  key={data.name}
                  type={data}
                  x={level}
                  y={index + implementationsOffset}
                  collapsable={true}
                  lastActive={false}
                />
              ))}
            </div>
          )}
      </div>
    )
  }
}

const scrollToRight = (element: Element, to: number, duration: number) => {
  if (duration <= 0) {
    return
  }
  const difference = to - element.scrollLeft
  const perTick = (difference / duration) * 10
  setTimeout(() => {
    element.scrollLeft = element.scrollLeft + perTick
    if (element.scrollLeft === to) {
      return
    }
    scrollToRight(element, to, duration - 10)
  }, 10)
}

const DocsHeader = styled.div`
  background: ${p => p.theme.colours.black02};
  padding-top: 20px;
  padding-bottom: 10px;

  .doc-category-item {
    font-size: 14px;
    font-weight: 600;
    word-wrap: break-word;
  }
  .doc-category-item .field-name {
    color: #f25c54;
  }
  div {
    background: transparent;
    pointer-events: none;
  }
`

const DocsDescription = styled(MarkdownContent)`
  font-size: 14px;
  padding: 0 16px 20px 16px;
  color: rgba(0, 0, 0, 0.5);
`
