/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import ExecuteButtonOperation from './ExecuteButtonOperation'
import { styled } from '../../styled'
import { connect } from 'react-redux'
import { runQuery, stopQuery } from '../../state/sessions/actions'
import { createStructuredSelector } from 'reselect'
import {
  getQueryRunning,
  getOperations,
  getSelectedSessionIdFromRoot,
} from '../../state/sessions/selectors'
import { toJS } from './util/toJS'

export interface ReduxProps {
  runQuery: (operationName?: string) => void
  stopQuery: (sessionId: string) => void
  queryRunning: boolean
  operations: any[]
  sessionId: string
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
class ExecuteButton extends React.Component<ReduxProps, State> {
  constructor(props) {
    super(props)

    this.state = {
      optionsOpen: false,
      highlight: null,
    }
  }

  render() {
    const { operations } = this.props
    const optionsOpen = this.state.optionsOpen
    const hasOptions = operations && operations.length > 1

    let options: any = null
    if (hasOptions && optionsOpen) {
      const highlight = this.state.highlight
      options = (
        <ExecuteBox>
          <ExecuteOptions>
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
          </ExecuteOptions>
        </ExecuteBox>
      )
    }

    // Allow click event if there is a running query or if there are not options
    // for which operation to run.
    let onClick
    if (this.props.queryRunning || !hasOptions) {
      onClick = this.onClick
    }

    // Allow mouse down if there is no running query, there are options for
    // which operation to run, and the dropdown is currently closed.
    let onMouseDown
    if (!this.props.queryRunning && hasOptions && !optionsOpen) {
      onMouseDown = this.onOptionsOpen
    }

    const pathJSX = this.props.queryRunning ? (
      <rect fill="#FFFFFF" x="10" y="10" width="13" height="13" rx="1" />
    ) : (
      <path d="M 11 9 L 24 16 L 11 23 z" />
    )

    return (
      <Wrapper>
        <Button
          isRunning={this.props.queryRunning}
          onMouseDown={onMouseDown}
          onClick={onClick}
          title="Execute Query (Ctrl-Enter)"
        >
          <svg
            width="35"
            height="35"
            viewBox={`${this.props.queryRunning ? 4 : 3}.5,4.5,24,24`}
          >
            {pathJSX}
          </svg>
        </Button>
        {options}
      </Wrapper>
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
    if (this.props.queryRunning) {
      this.props.stopQuery(this.props.sessionId)
    } else {
      this.props.runQuery()
    }
  }

  private onOptionSelected = operation => {
    this.setState({ optionsOpen: false } as State)
    if (!operation) {
      return
    }
    this.props.runQuery(operation.name && operation.name.value)
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
        if (downTarget.parentNode) {
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
              ) || this.props.operations[0],
            )
            firstTime = false
          }
        }
      }
    }

    document.addEventListener('mouseup', onMouseUp)
  }
}

const mapStateToProps = createStructuredSelector({
  queryRunning: getQueryRunning,
  operations: getOperations,
  sessionId: getSelectedSessionIdFromRoot,
})

export default connect(
  mapStateToProps,
  { runQuery, stopQuery },
)(toJS(ExecuteButton))

const Wrapper = styled.div`
  position: absolute;
  left: -62px;
  z-index: 5;
  top: 15px;
  margin: 0 14px 0 28px;
`

interface ButtonProps {
  isRunning: boolean
}

const Button = styled<ButtonProps, 'div'>('div')`
  width: 60px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100%;
  transition: background-color 100ms;
  background-color: ${p =>
    p.isRunning
      ? p.theme.editorColours.executeButtonSubscription
      : p.theme.editorColours.executeButton};
  border: 6px solid ${p => p.theme.editorColours.executeButtonBorder};
  cursor: pointer;
  user-select: none;

  svg {
    fill: ${p => (p.theme.mode === 'light' ? 'white' : 'inherit')};
  }

  &:hover {
    background-color: ${p =>
      p.isRunning
        ? p.theme.editorColours.executeButtonSubscriptionHover
        : p.theme.editorColours.executeButtonHover};
  }
`

const ExecuteBox = styled.div`
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.25);
  padding: 8px 0;
  left: -1px;
  margin: 0;
  position: absolute;
  top: 78px;
  z-index: 100;
  user-select: none;

  &:before {
    position: absolute;
    background: white;
    content: '';
    top: -4px;
    left: 34px;
    transform: rotate(45deg);
    width: 8px;
    height: 8px;
  }
`

const ExecuteOptions = styled.ul`
  max-height: 270px;
  overflow: scroll;

  li {
    cursor: pointer;
    list-style: none;
    min-width: 100px;
    padding: 2px 30px 4px 10px;
  }

  li.selected {
    background: rgb(39, 174, 96);
    color: white;
  }
`
