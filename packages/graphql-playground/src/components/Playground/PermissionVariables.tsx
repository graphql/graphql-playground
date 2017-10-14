import * as React from 'react'
import { PermissionQueryArgument } from '../../types'
import { Icon, $v } from 'graphcool-styles'
import VariableTag from './VariableTag'

interface Props {
  variables: any
  selectedVariableNames: string[]
  onToggleVariableSelection: (variable: PermissionQueryArgument) => void
}

export default class PermissionVariables extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }
  render() {
    const { variables } = this.props
    return (
      <div className="permission-variables">
        <style jsx={true}>{`
          .permission-variables {
            @p: .z2, .overflowYScroll, .flexFixed;
            background: #142533;
            padding: 20px;
            padding-top: 26px;
            :global(.tag) {
              @p: .mb6, .mr6;
            }
            border-top: 8px solid rgba(23, 42, 58, 1);
          }
          .variable-category {
            @p: .pb38;
          }
          .variable-title {
            @p: .fw6, .f12, .white30, .ttu, .mb16, .flex, .itemsCenter;
          }
          h3 {
            @p: .white40, .fw6, .ttu, .mt0, .mb25;
          }
        `}</style>
        <h3>Permission Variables</h3>
        {this.sortVariables(Object.keys(variables)).map(group =>
          <div className="variable-category" key={group}>
            <div className="variable-title">
              <span>
                {group}
              </span>
              {group === 'Authenticated User' &&
                <Icon
                  src={require('graphcool-styles/icons/stroke/lock.svg')}
                  color={$v.white40}
                  stroke={true}
                  strokeWidth={2.5}
                  height={18}
                  width={18}
                  className="ml10"
                />}
            </div>
            {variables[group].map(variable =>
              <VariableTag
                key={variable.name}
                active={this.props.selectedVariableNames.includes(
                  variable.name,
                )}
                onClick={this.toggleVariableSelection(variable)}
                className="tag"
                variable={variable}
              />,
            )}
          </div>,
        )}
      </div>
    )
  }

  private toggleVariableSelection = variable => () => {
    this.props.onToggleVariableSelection(variable)
  }

  private sortVariables(categories) {
    const cats = categories.slice()
    return cats.sort((a, b) => {
      if (a === 'Authenticated User') {
        return -1
      }
      if (b === 'Authenticated User') {
        return 1
      }
      return a < b ? -1 : 1
    })
  }
}
