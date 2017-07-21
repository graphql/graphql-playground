/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as classNames from 'classnames'
import { GraphQLList, GraphQLNonNull, isType } from 'graphql'
import ArgumentInline from './ArgumentInline'

interface Props {
  type?: any
  onClick?: (field: any) => void
}

export default class TypeLink extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps) {
    return this.props.type !== nextProps.type
  }

  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.type)
    }
  }

  render() {
    const { type, onClick } = this.props
    return (
      <div
        className={classNames('doc-category-item', { click: onClick })}
        onClick={this.onClick}
      >
        <style jsx={true}>{`
          .doc-category-item {
            @p: .mv0, .ph16, .pv6;
          }
          .doc-category-item.click:hover {
            @p: .bgBlack07;
          }
          .doc-category-item.click {
            @p: .pointer;
          }
        `}</style>
        {!isType(type) &&
          <span>
            <span className="field-name">
              {type.name}
            </span>
            {type.args &&
            type.args.length > 0 && [
              '(',
              <span key="args">
                {type.args.map(arg =>
                  <ArgumentInline key={arg.name} arg={arg} />,
                )}
              </span>,
              ')',
            ]}
            {': '}
          </span>}
        <span className="type-name">
          {renderType(type.type || type)}
        </span>
      </div>
    )
  }
}

function renderType(type) {
  if (type instanceof GraphQLNonNull) {
    return (
      <span>
        {renderType(type.ofType)}
        {'!'}
      </span>
    )
  }
  if (type instanceof GraphQLList) {
    return (
      <span>
        {'['}
        {renderType(type.ofType)}
        {']'}
      </span>
    )
  }
  return (
    <span>
      {type.name}
    </span>
  )
}
