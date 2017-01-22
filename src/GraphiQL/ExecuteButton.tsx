/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as cx from 'classnames'

interface Props {
  onRun: Function
  onStop: Function
  isRunning: boolean
  operations: any[]
}

interface State {
  optionsOpen: boolean
  highlight: any
}

/**
 * ExecuteButton
 *
 * What a nice round shiny button. Shows a drop-down when there are multiple
 * queries to run.
 */
export class ExecuteButton extends React.Component<Props, State> {

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
      options =
        <ul className='execute-options'>
          {operations.map(operation =>
            <li
              key={operation.name ? operation.name.value : '*'}
              className={operation === highlight ? 'selected' : ''}
              onMouseOver={() => this.setState({ highlight: operation } as State)}
              onMouseOut={() => this.setState({ highlight: null } as State)}
              onMouseUp={() => this._onOptionSelected(operation)}>
              {operation.name ? operation.name.value : '<Unnamed>'}
            </li>,
          )}
        </ul>
    }

    // Allow click event if there is a running query or if there are not options
    // for which operation to run.
    let onClick
    if (this.props.isRunning || !hasOptions) {
      onClick = this._onClick
    }

    // Allow mouse down if there is no running query, there are options for
    // which operation to run, and the dropdown is currently closed.
    let onMouseDown
    if (!this.props.isRunning && hasOptions && !optionsOpen) {
      onMouseDown = this._onOptionsOpen
    }

    const pathJSX = this.props.isRunning ?
      <rect fill='#FFFFFF' x='10' y='10' width='13' height='13' rx='1' /> :
      <path d='M 11 9 L 24 16 L 11 23 z' />

    return (
      <div className='execute-button-wrap'>
        <style jsx={true}>{`
          .execute-button-wrap {
            position: absolute !important;
            left: -62px;
            z-index: 2;
            top: 15px;
          }

          .graphcool-execute-button {
            @inherit: .br100, .flex, .itemsCenter, .justifyCenter, .pointer;
            background-color: rgb(185,191,196);
            border: 6px solid rgb(11,20,28);
            width: 71px;
            height: 71px;
          }

          .running {
            @inherit: .bgrRed;
          }
        `}</style>
        <button
          className={cx('graphcool-execute-button', {
            'running': this.props.isRunning,
          })}
          onMouseDown={onMouseDown}
          onClick={onClick}
          title='Execute Query (Ctrl-Enter)'>
          <svg width='35' height='35' viewBox='3.5,4.5,24,24'>{pathJSX}</svg>
        </button>
        {options}
      </div>
    )
  }

  _onClick = () => {
    if (this.props.isRunning) {
      this.props.onStop()
    } else {
      this.props.onRun()
    }
  }

  _onOptionSelected = operation => {
    this.setState({ optionsOpen: false } as State)
    this.props.onRun(operation.name && operation.name.value)
  }

  _onOptionsOpen = downEvent => {
    let initialPress = true
    const downTarget = downEvent.target
    this.setState({ highlight: null, optionsOpen: true })

    let onMouseUp: any = upEvent => {
      if (initialPress && upEvent.target === downTarget) {
        initialPress = false
      } else {
        document.removeEventListener('mouseup', onMouseUp)
        onMouseUp = null
        const isOptionsMenuClicked = (
          downTarget.parentNode.compareDocumentPosition(upEvent.target) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
        )
        if (!isOptionsMenuClicked) { // menu calls setState if it was clicked
          this.setState({ optionsOpen: false } as State)
        }
      }
    }

    document.addEventListener('mouseup', onMouseUp)
  }
}
