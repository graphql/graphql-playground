/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as classNames from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { GraphQLList, GraphQLNonNull, isType } from 'graphql'
import ArgumentInline from './ArgumentInline'
import { addStack } from '../../actions/graphiql-docs'

interface StateFromProps {
  navStack: any[]
}

interface DispatchFromProps {
  addStack: (field: any, level: number) => any
}

interface Props {
  type: any
  level: number
  clickable?: boolean
}

class TypeLink extends React.Component<
  Props & StateFromProps & DispatchFromProps,
  {}
> {
  static defaultProps: Partial<Props> = {
    clickable: true,
  }

  shouldComponentUpdate(nextProps: Props & StateFromProps) {
    return (
      this.props.type !== nextProps.type ||
      this.props.navStack !== nextProps.navStack
    )
  }

  onClick = () => {
    if (this.props.clickable) {
      this.props.addStack(this.props.type, this.props.level)
    }
  }

  isActive(navStack: any[], type: any, level: number) {
    return navStack[level] === type
  }

  render() {
    const { type, clickable, navStack, level } = this.props
    const isActive = clickable && this.isActive(navStack, type, level)
    return (
      <div
        className={classNames('doc-category-item', {
          clickable,
          active: isActive,
        })}
        onClick={this.onClick}
      >
        <style jsx={true} global={true}>{`
          .doc-category-item.clickable:hover {
            color: #fff !important;

            & .field-name,
            & .type-name,
            & .arg-name {
              color: #fff !important;
            }
          }
        `}</style>
        <style jsx={true}>{`
          .doc-category-item {
            @p: .mv0, .ph16, .pv6;
          }
          .doc-category-item.clickable:hover {
            @p: .pointer, .white;
            background-color: #2a7ed3;
          }
          .doc-category-item.active {
            @p: .bgBlack07;
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

const mapStateToProps = state => ({
  navStack: state.graphiqlDocs.navStack,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addStack,
    },
    dispatch,
  )

export default connect<StateFromProps, DispatchFromProps, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(TypeLink)
