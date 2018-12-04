import * as React from 'react'
import { GraphQLList, GraphQLNonNull, isType } from 'graphql'
import ArgumentInline from '../../DocExplorer/ArgumentInline'
import { styled } from '../../../../styled'

export interface Props {
  type: any
  className?: string
  beforeNode?: JSX.Element | null | false
  afterNode?: JSX.Element | null | false
  showParentName?: boolean
  collapsable?: boolean
}

export default class SDLType extends React.Component<Props> {
  render() {
    const {
      type,
      className,
      beforeNode,
      afterNode,
      showParentName,
    } = this.props
    const isGraphqlType = isType(type)

    const fieldName =
      showParentName && type.parent ? (
        <span>
          {type.parent.name}.<b>{type.name}</b>
        </span>
      ) : (
        type.name
      )

    return (
      <DocsCategoryItem
        className={`doc-category-item${className ? className : ''}`}
      >
        {beforeNode}
        {beforeNode && ' '}
        {!isGraphqlType && (
          <span>
            <span className="field-name">{fieldName}</span>
            {type.args &&
              type.args.length > 0 && [
                '(',
                <span key="args">
                  {type.args.map(arg => (
                    <ArgumentInline key={arg.name} arg={arg} />
                  ))}
                </span>,
                ')',
              ]}
            {': '}
          </span>
        )}
        <span className="type-name">{renderType(type.type || type)}</span>
        {type.defaultValue !== undefined ? (
          <DefaultValue>
            {' '}
            = <span>{`${type.defaultValue}`}</span>
          </DefaultValue>
        ) : (
          undefined
        )}
        {afterNode && ' '}
        {afterNode}
      </DocsCategoryItem>
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
  return <span>{type.name}</span>
}

interface DocsCategoryItemProps {
  clickable?: boolean
  active?: boolean
}

const DocsCategoryItem = styled<DocsCategoryItemProps, 'div'>('div')`
	position: relative;
	padding: 6px 16px;
	overflow: auto;
	font-size: 14px;
	transition: 0.1s background-color;
	background: ${p =>
    p.active ? p.theme.colours.black07 : p.theme.colours.white};

	cursor: ${p => (p.clickable ? 'pointer' : 'select')};

	// &:hover {
	// 	color: ${p => p.theme.colours.white};
	// 	background: #2a7ed3;
	// 	.field-name,
	// 	.type-name,
	// 	.arg-name,
	// 	span {
	// 		color: ${p => p.theme.colours.white} !important;
	// 	}
	// }
	b {
		font-weight: 600;
	}
`

const DefaultValue = styled.span`
  color: ${p => p.theme.colours.black30};
  span {
    color: #1f61a9;
  }
`
