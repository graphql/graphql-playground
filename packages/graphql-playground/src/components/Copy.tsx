import * as React from 'react'
import { $v } from 'graphcool-styles'
import * as CopyToClipboard from 'react-copy-to-clipboard'

interface Props {
  text: string
  color?: string
}

interface State {
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
    const { text } = this.props
    let { color } = this.props

    color = color || $v.blue

    return (
      <CopyToClipboard text={text} onCopy={this.onCopy}>
        <div className="copy">
          <style jsx={true}>{`
            .copy {
              @p: .relative;
            }
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
            .indicator {
              @p: .absolute;
              top: -20px;
              left: 50%;
              transform: translate(-50%, 0);
              animation: copying 700ms linear;
            }
          `}</style>
          {this.state.copied &&
            <div className="indicator" style={{ color }}>
              Copied
            </div>}
          {this.props.children}
        </div>
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
