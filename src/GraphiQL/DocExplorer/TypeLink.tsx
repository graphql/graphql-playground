/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as cx from 'classnames'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { GraphQLList, GraphQLNonNull, isType } from 'graphql'
import { Icon } from 'graphcool-styles'
import ArgumentInline from './ArgumentInline'
import { addStack } from '../../actions/graphiql-docs'

interface StateFromProps {
  navStack: any[]
}

interface DispatchFromProps {
  addStack: (field: any, level: number) => any
}

export interface Props {
  type: any
  level: number
  clickable?: boolean
  className?: string
  beforeNode?: JSX.Element | null
  afterNode?: JSX.Element | null
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
    const {
      type,
      clickable,
      navStack,
      level,
      className,
      beforeNode,
      afterNode,
    } = this.props
    const isActive = clickable && this.isActive(navStack, type, level)
    const isLastActive = isActive && level === navStack.length - 1
    const isGraphqlType = isType(type)
    return (
      <div
        className={cx('doc-category-item', className, {
          clickable,
          active: isActive,
          lastActive: isLastActive,
        })}
        onClick={this.onClick}
      >
        <style jsx={true} global={true}>{`
          .doc-category-item.lastActive,
          .doc-category-item.clickable:hover {
            background-color: #2a7ed3 !important;
            color: #fff !important;

            & .field-name,
            & .type-name,
            & .arg-name {
              color: #fff !important;
            }
          }
          .doc-category-item.active:not(.lastActive) svg {
            fill: #2a7ed3 !important;
          }
        `}</style>
        <style jsx={true}>{`
          .doc-category-item {
            @p: .mv0, .ph16, .pv6, .relative;
          }
          .doc-category-item.clickable:hover {
            @p: .pointer, .white;
          }
          .doc-category-item.active {
            @p: .bgBlack07;
          }
          .doc-category-icon {
            @p: .absolute;
            right: 8px;
            top: calc(50% - 6px);
          }
        `}</style>
        {beforeNode}
        {beforeNode && ' '}
        {!isGraphqlType &&
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
        {clickable &&
          <span className="doc-category-icon">
            <Icon
              src={require('graphcool-styles/icons/stroke/arrowRight.svg')}
              color="rgba(0, 0, 0, .2)"
              width={16}
              height={12}
            />
          </span>}
        {afterNode && ' '}
        {afterNode}
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
