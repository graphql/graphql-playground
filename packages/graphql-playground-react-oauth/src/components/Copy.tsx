import * as React from 'react'
import { styled } from '../styled'
import * as CopyToClipboard from 'react-copy-to-clipboard'

export interface Props {
  text: string
  color?: string
  className?: string
}

export interface State {
  copied: boolean
}

export default class Copy extends React.Component<Props, State> {
  private copyTimer: any

  constructor(props) {
    super(props)

    this.state = {
      copied: false,
    }
  }

  componentWillUnmount() {
    clearTimeout(this.copyTimer)
  }

  render() {
    const { text, color } = this.props

    return (
      <CopyToClipboard text={text} onCopy={this.onCopy}>
        <CopyBox>
          {this.state.copied && <Indicator color={color}>Copied</Indicator>}
          {this.props.children}
        </CopyBox>
      </CopyToClipboard>
    )
  }

  private onCopy = () => {
    this.setState({ copied: true } as State)
    this.copyTimer = window.setTimeout(
      () => this.setState({ copied: false } as State),
      500,
    )
  }
}

const CopyBox = styled.div`
  position: relative;
`

const Indicator = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translate(-50%, 0);
  animation: copying 700ms linear;
  color: ${p => (p.color ? p.color : p.theme.colours.darkBlue30)};

  @keyframes copying {
    0% {
      opacity: 0;
      transform: translate(-50%, 0);
    }

    50% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50px);
    }
  }
`
