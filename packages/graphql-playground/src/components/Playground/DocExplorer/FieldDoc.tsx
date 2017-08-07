/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Argument from './Argument'
import { GraphQLEnumType, GraphQLUnionType, GraphQLScalarType } from 'graphql'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'
import TypeLink from './TypeLink'
import DocTypeSchema from './DocTypeSchema'
import ScalarTypeSchema from './DocsTypes/ScalarType'
import EnumTypeSchema from './DocsTypes/EnumTypeSchema'
import UnionTypeSchema from './DocsTypes/UnionTypeSchema'
import { serialize, getDeeperType } from './utils'

export interface Props {
  schema: any
  field: any
  level: number
}

export interface State {
  showDeprecated: boolean
}

export default class FieldDoc extends React.Component<Props, State> {
  state = { showDeprecated: false }

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
    const explorer = ReactDOM.findDOMNode(this)
    const explorerDoc: any =
      explorer.parentNode && explorer.parentNode.parentNode
    // TODO see browser compatibility scrollWidth && scrollLeft
    scrollToRight(
      explorerDoc,
      explorerDoc.scrollWidth - explorerDoc.offsetWidth,
      50,
    )
  }

  render() {
    const { schema, field, level } = this.props
    let type = field.type || field
    const obj = serialize(schema, field)
    type = getDeeperType(type)
    const argsOffset = obj.fields.length + obj.interfaces.length
    const implementationsOffset =
      obj.fields.length + obj.interfaces.length + obj.args.length

    return (
      <div>
        <style jsx={true} global={true}>{`
          .doc-header .doc-category-item {
            @p: .fw6, .f14;
          }
          .doc-header .doc-category-item .field-name {
            color: #f25c54;
          }
          .doc-description {
            @p: .ph16, .black50;
          }
        `}</style>
        <style jsx={true}>{`
          .doc-header {
            @p: .bgBlack02, .pb10, .pt20;
          }
          .doc-type-description {
            @p: .pb16;
          }
          .doc-deprecation {
            @p: .ph16, .black50;
          }
        `}</style>
        <div className="doc-header">
          <TypeLink type={field} x={level} y={0} clickable={false} />
        </div>
        <MarkdownContent
          className="doc-type-description"
          markdown={field.description || 'No Description'}
        />

        <div className="doc-category-title">
          {'type details'}
        </div>
        <MarkdownContent
          className="doc-description"
          markdown={type.description || 'No Description'}
        />

        {type instanceof GraphQLScalarType && <ScalarTypeSchema type={type} />}
        {type instanceof GraphQLEnumType && <EnumTypeSchema type={type} />}
        {type instanceof GraphQLUnionType &&
          <UnionTypeSchema type={type} schema={schema} />}

        {obj.fields.length > 0 &&
          <DocTypeSchema
            type={type}
            fields={obj.fields}
            interfaces={obj.interfaces}
            level={level}
          />}

        {obj.args.length > 0 &&
          <div>
            <div className="doc-category-title">arguments</div>
            {obj.args.map((arg, index) =>
              <div key={arg.name}>
                <div>
                  <Argument arg={arg} x={level} y={index + argsOffset} />
                </div>
              </div>,
            )}
          </div>}

        {obj.implementations.length > 0 &&
          <div>
            <div className="doc-category-title">implementations</div>
            {obj.implementations.map((data, index) =>
              <TypeLink
                key={data.name}
                type={data}
                x={level}
                y={index + implementationsOffset}
              />,
            )}
          </div>}
      </div>
    )
  }
}

const scrollToRight = (element: Element, to: number, duration: number) => {
  if (duration <= 0) {
    return
  }
  const difference = to - element.scrollLeft
  const perTick = difference / duration * 10
  setTimeout(() => {
    element.scrollLeft = element.scrollLeft + perTick
    if (element.scrollLeft === to) {
      return
    }
    scrollToRight(element, to, duration - 10)
  }, 10)
}
