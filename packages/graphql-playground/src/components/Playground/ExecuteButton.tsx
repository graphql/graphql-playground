/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as cx from 'classnames'
import { withTheme, ThemeInterface } from '../Theme'
import * as cn from 'classnames'
import ExecuteButtonOperation from './ExecuteButtonOperation'

export interface Props {
  onRun: (data?: any) => void
  onStop: () => void
  isRunning: boolean
  operations: any[]
}

export interface State {
  optionsOpen: boolean
  highlight: any
}

let firstTime = true

/**
 * ExecuteButton
 *
 * What a nice round shiny button. Shows a drop-down when there are multiple
 * queries to run.
 */
class ExecuteButton extends React.Component<Props & ThemeInterface, State> {
  constructor(props) {
    super(props)

    this.state = {
      optionsOpen: false,
      highlight: null,
    }
  }

  render() {
    const operations = this.props.operations
    const optionsOpen = this.state.optionsOpen
    const hasOptions = operations && operations.length > 1

    let options: any = null
    if (hasOptions && optionsOpen) {
      const highlight = this.state.highlight
      options = (
        <ul className="execute-options">
          {operations.map(operation => (
            <ExecuteButtonOperation
              operation={operation}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
              onMouseUp={this.handleMouseUp}
              highlight={highlight}
              key={operation.name ? operation.name.value : '*'}
            />
          ))}
        </ul>
      )
    }

    // Allow click event if there is a running query or if there are not options
    // for which operation to run.
    let onClick
    if (this.props.isRunning || !hasOptions) {
      onClick = this.onClick
    }

    // Allow mouse down if there is no running query, there are options for
    // which operation to run, and the dropdown is currently closed.
    let onMouseDown
    if (!this.props.isRunning && hasOptions && !optionsOpen) {
      onMouseDown = this.onOptionsOpen
    }

    const pathJSX = this.props.isRunning ? (
      <rect fill="#FFFFFF" x="10" y="10" width="13" height="13" rx="1" />
    ) : (
      <path d="M 11 9 L 24 16 L 11 23 z" />
    )

    return (
      <div className={cn('execute-button-wrap', this.props.localTheme)}>
        <style jsx={true}>{`
          .execute-button-wrap {
            position: absolute;
            left: -62px;
            z-index: 5;
            top: 15px;
            margin: 0 14px 0 28px;
          }

          .graphcool-execute-button {
            @p: .br100, .flex, .itemsCenter, .justifyCenter, .pointer;
            background-color: rgb(185, 191, 196);
            border: 6px solid rgb(11, 20, 28);
            width: 60px;
            height: 60px;
          }

          .graphcool-execute-button.light {
            background-color: #0f202d;
            border: 6px solid #eeeff0;
          }

          .graphcool-execute-button.light :global(svg) {
            fill: white;
          }

          .graphcool-execute-button.running {
            @p: .bgrRed;
          }
        `}</style>
        <div
          className={cx('graphcool-execute-button', this.props.localTheme, {
            running: this.props.isRunning,
          })}
          onMouseDown={onMouseDown}
          onClick={onClick}
          title="Execute Query (Ctrl-Enter)"
        >
          <svg
            width="35"
            height="35"
            viewBox={`${this.props.isRunning ? 4 : 3}.5,4.5,24,24`}
          >
            {pathJSX}
          </svg>
        </div>
        {options}
      </div>
    )
  }

  private handleMouseOver = (operation: any) => {
    this.setState({ highlight: operation })
  }

  private handleMouseOut = () => {
    this.setState({ highlight: null })
  }

  private handleMouseUp = (operation: any) => {
    this.onOptionSelected(operation)
  }

  private onClick = () => {
    if (this.props.isRunning) {
      this.props.onStop()
    } else {
      this.props.onRun()
    }
  }

  private onOptionSelected = operation => {
    this.setState({ optionsOpen: false } as State)
    this.props.onRun(operation.name && operation.name.value)
  }

  private onOptionsOpen = downEvent => {
    let initialPress = true
    const downTarget = downEvent.target
    this.setState({ highlight: null, optionsOpen: true })

    let onMouseUp: any = upEvent => {
      if (initialPress && upEvent.target === downTarget) {
        initialPress = false
      } else {
        document.removeEventListener('mouseup', onMouseUp)
        onMouseUp = null
        const isOptionsMenuClicked =
          // tslint:disable-next-line
          downTarget.parentNode.compareDocumentPosition(upEvent.target) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
        if (!isOptionsMenuClicked) {
          // menu calls setState if it was clicked
          this.setState({ optionsOpen: false } as State)
        }
        if (firstTime) {
          this.onOptionSelected(
            this.props.operations.find(
              op => op.name.value === upEvent.target.textContent,
            ),
          )
          firstTime = false
        }
      }
    }

    document.addEventListener('mouseup', onMouseUp)
  }
}

export default withTheme<Props>(ExecuteButton)
