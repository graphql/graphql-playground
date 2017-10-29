import * as React from 'react'
import Popup from './Popup'
import { throttle } from 'lodash'
import * as cn from 'classnames'
import { Button } from './Button'

export interface Props {
  onRequestClose: (endpoint: string) => void
  endpoint: string
}

export interface State {
  endpoint: string
  valid?: boolean
}

export default class EndpointPopup extends React.Component<Props, State> {
  checkEndpoint = throttle(() => {
    if (
      this.state.endpoint.match(
        /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      )
    ) {
      fetch(this.state.endpoint, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
        __schema {
          queryType {
            kind
          }
        }
      }`,
        }),
      })
        .then(res => {
          this.setState({ valid: res.status < 400 })
        })
        .catch(err => {
          this.setState({ valid: false })
        })
    }
  }, 500)
  constructor(props) {
    super()
    this.state = {
      endpoint: props.endpoint,
    }
  }
  componentDidMount() {
    this.checkEndpoint()
  }
  render() {
    const { valid } = this.state
    return (
      <Popup onRequestClose={this.close} darkBg={true}>
        <div className="content">
          <style jsx={true}>{`
            .content {
              @p: .bbox;
            }
            form {
              @p: .flex, .flexAuto, .w100;
            }
            input {
              @p: .bgWhite10, .br2, .pv16, .ph25, .fw6, .white, .f16, .db, .w100,
                .tc, .flexAuto, .flex;
              transition: 0.25s color;
            }
            input.valid {
              @p: .green;
            }
            input.invalid {
              @p: .red;
            }
            .content :global(.button) {
              @p: .ph16;
              background: #da1b7f;
            }
            .content :global(.button:hover) {
              @p: .ph16, .bgPurple;
            }
            h1 {
              @p: .white80, .fw4, .ml38;
            }
            .logo-wrapper {
              @p: .flex, .justifyCenter, .itemsCenter;
            }
            .logo {
              @p: .flex, .itemsCenter, .mb60, .justifyBetween;
            }
            .logo img {
              width: 78px;
              height: 78px;
            }
          `}</style>
          <div className="logo-wrapper">
            <div className="logo">
              <img src={require('../assets/logo.png')} alt="" />
              <h1>GraphQL Playground</h1>
            </div>
          </div>
          <form action="" onSubmit={this.submit}>
            <input
              type="text"
              placeholder="Enter an endpoint url..."
              value={this.state.endpoint}
              onChange={this.onChangeEndpoint}
              className={cn({
                valid: typeof valid === 'boolean' && valid,
                invalid: typeof valid === 'boolean' && !valid,
              })}
              autoFocus={true}
            />
            {valid && <Button onClick={this.close}>Use Endpoint</Button>}
          </form>
        </div>
      </Popup>
    )
  }

  private onChangeEndpoint = e => {
    this.setState({ endpoint: e.target.value }, this.checkEndpoint)
  }

  private submit = e => {
    e.preventDefault()
    this.close()
  }

  private close = () => {
    if (this.state.valid) {
      this.props.onRequestClose(this.state.endpoint)
    }
  }
}
