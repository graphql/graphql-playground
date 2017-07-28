import * as React from 'react'
import { Icon, $v } from 'graphcool-styles'
import * as keycode from 'keycode'
import { Header } from './HttpHeaders'

export interface Props {
  header: Header
  index: number
  onChange: (index: number, Header) => void
  onDelete: (index: number) => void
}

export interface State {
  name: string
  value: string
  editing: boolean
}

export default class HttpListItem extends React.Component<Props, State> {
  private inputRef: any

  constructor(props) {
    super(props)
    this.state = {
      name: props.header.name,
      value: props.header.value,
      editing: false,
    }
  }

  componentDidMount() {
    // If new element focus it
    if (this.props.index === -1) {
      this.inputRef.focus()
    }
  }

  render() {
    const { header } = this.props
    const { editing, name, value } = this.state
    return (
      <div className="row">
        <style jsx={true}>{`
          .row {
            @p: .flex, .flexRow, .itemsCenter, .bb, .bBlack10, .ph16, .pv10;
          }
          .row .name {
            @p: .toe, .overflowHidden, .nowrap;
            flex: 0 30%;
          }
          .row .value {
            @p: .toe, .overflowHidden, .nowrap;
            flex: 0 60%;
          }
          .row input {
            @p: .f14, .black50, .w100;
            background: transparent;
          }
          .row .icon {
            @p: .pointer, .tr, .flex, .justifyCenter, .flex1;
          }
        `}</style>
        <div className="name input">
          <input
            ref={ref => (this.inputRef = ref)}
            name="name"
            placeholder="Type a name..."
            value={name}
            onChange={this.handleEditChange}
            onKeyDown={this.handleKeyDown}
          />
        </div>
        <div className="value input">
          <input
            name="value"
            placeholder="Type the content..."
            value={value}
            onChange={this.handleEditChange}
            onKeyDown={this.handleKeyDown}
          />
        </div>
        {editing
          ? <div className="icon" onClick={this.handleValidate}>
              <Icon
                src={require('graphcool-styles/icons/fill/check.svg')}
                color={$v.gray40}
                width={20}
                height={20}
              />
            </div>
          : <div className="icon" onClick={this.handleDelete}>
              <Icon
                src={require('graphcool-styles/icons/stroke/cross.svg')}
                color={$v.gray40}
                width={10}
                height={10}
                stroke={true}
                strokeWidth={6}
              />
            </div>}
      </div>
    )
  }

  private handleKeyDown = e => {
    // Handle enter press and save header
    if (keycode(e) === 'enter' && this.state.editing) {
      this.handleValidate()
    }
  }

  private handleEditChange = ({ target }) => {
    this.setState({ [target.name]: target.value, editing: true })
  }

  private handleValidate = () => {
    if (this.state.name && this.state.value) {
      this.props.onChange(this.props.index, {
        name: this.state.name,
        value: this.state.value,
      })
      this.setState({ editing: false })
    }
  }

  private handleDelete = () => {
    this.props.onDelete(this.props.index)
  }
}
