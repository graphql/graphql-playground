/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import * as cx from 'classnames'
import { withTheme, LocalThemeInterface } from '../Theme'
import ExecuteButtonOperation from './ExecuteButtonOperation'
import { withProps, styled } from '../../styled'
import * as theme from 'styled-theming'
import { mix, lighten } from 'polished'

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
class ExecuteButton extends React.Component<
  Props & LocalThemeInterface,
  State
> {
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
      <Wrapper className={this.props.localTheme}>
        <Button
          className={cx(this.props.localTheme)}
          isRunning={String(this.props.isRunning)}
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
            ) || this.props.operations[0],
          )
          firstTime = false
        }
      }
    }

    document.addEventListener('mouseup', onMouseUp)
  }
}

export default withTheme<Props>(ExecuteButton)

const Wrapper = styled.div`
  position: absolute;
  left: -62px;
  z-index: 5;
  top: 15px;
  margin: 0 14px 0 28px;
`

const buttonBackground = theme.variants('mode', 'isRunning', {
  true: {
    light: p => p.theme.colours.red,
    dark: p => p.theme.colours.red,
  },
  false: {
    dark: 'rgb(185, 191, 196)',
    light: p => mix(0.6, p.theme.colours.darkBlue, 'white'),
  },
})

const buttonBackgroundHover = theme.variants('mode', 'isRunning', {
  true: {
    light: p => lighten(0.1, p.theme.colours.red),
    dark: p => lighten(0.1, p.theme.colours.red),
  },
  false: {
    dark: 'rgb(195, 201, 206)',
    light: p => mix(0.8, p.theme.colours.darkBlue, 'white'),
  },
})

const buttonBorderColor = theme('mode', {
  light: '#eeeff0',
  dark: 'rgb(11, 20, 28)',
})

interface ButtonProps {
  isRunning: string
}

const Button = withProps<ButtonProps>()(styled.div)`
  width: 60px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100%;
  transition: background-color 100ms;
  background-color: ${buttonBackground};
  border: 6px solid ${buttonBorderColor};
  cursor: pointer;

  svg {
    fill: ${p => (p.theme.mode === 'light' ? 'white' : 'inherit')};
  }

  &:hover {
    background-color: ${buttonBackgroundHover};
  }
`
