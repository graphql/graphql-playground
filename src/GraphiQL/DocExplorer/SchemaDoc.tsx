/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'

import TypeLink from 'graphiql/dist/components/DocExplorer/TypeLink'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'

interface Props {
  schema: any
  onClickType: any
}

interface State {

}

// Render the top level Schema
export default class SchemaDoc extends React.Component<Props, State> {

  shouldComponentUpdate(nextProps) {
    return this.props.schema !== nextProps.schema
  }

  render() {
    const schema = this.props.schema
    const queryType = schema.getQueryType()
    const mutationType = schema.getMutationType && schema.getMutationType()
    const subscriptionType =
      schema.getSubscriptionType && schema.getSubscriptionType()

    return (
      <div className='root'>
        <MarkdownContent
          className='doc-type-description'
          markdown={
            'A GraphQL schema provides a root type for each kind of operation.'
          }
        />
        <div className='doc-category'>
          <div className='doc-category-title'>
            {'root types'}
          </div>
          <div className='doc-category-item'>
            <span className='keyword'>{'query'}</span>
            {': '}
            <TypeLink type={queryType} onClick={this.props.onClickType} />
          </div>
          {
            mutationType &&
            <div className='doc-category-item'>
              <span className='keyword'>{'mutation'}</span>
              {': '}
              <TypeLink type={mutationType} onClick={this.props.onClickType} />
            </div>
          }
          {
            subscriptionType &&
            <div className='doc-category-item'>
              <span className='keyword'>{'subscription'}</span>
              {': '}
              <TypeLink
                type={subscriptionType}
                onClick={this.props.onClickType}
              />
            </div>
          }
        </div>
      </div>
    )
  }
}
