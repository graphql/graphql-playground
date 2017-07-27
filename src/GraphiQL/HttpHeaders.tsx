import * as React from 'react'
import Tooltip from 'graphcool-tmp-ui/lib/Tooltip'
import { Icon, $v } from 'graphcool-styles'

export interface Header {
  name: string
  value: string
  edited?: boolean
}

export interface Props {
  headers?: Header[]
  onChange?: (headers: Header[]) => void
}

export interface State {
  open: boolean
  editIndex: number
  headers: Header[]
}

class HttpHeaders extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      editIndex: -1,
      headers: props.headers || [],
    }
  }

  handleToggle = () => {
    this.setState({ open: !this.state.open })
  }

  handleEdit = index => {
    if (this.state.headers[index].name && this.state.headers[index].value) {
      this.setState({ editIndex: index })
    }
  }

  handleEditChange = ({ target }, index) => {
    this.setState(({ headers }) => {
      headers[index][target.name] = target.value
      headers[index].edited = true
      return { headers }
    })
  }

  handleValidate = index => {
    if (this.state.headers[index].name && this.state.headers[index].value) {
      this.setState(({ headers }) => {
        delete headers[index].edited
        if (this.props.onChange) {
          this.props.onChange(headers)
        }
        return { headers }
      })
    }
  }

  handleDelete = index => {
    this.setState(({ headers, editIndex }) => {
      headers.splice(index, 1)
      if (this.props.onChange) {
        this.props.onChange(headers)
      }
      return { headers }
    })
  }

  handleClickNewHeader = () => {
    // If last element is empty don't create a new one
    if (this.state.headers.length > 0) {
      const lastHeader = this.state.headers[this.state.headers.length - 1]
      if (!lastHeader.name && !lastHeader.value) {
        return
      }
    }
    this.setState(({ headers }) => {
      headers.push({
        name: '',
        value: '',
      })
      return { headers, editIndex: headers.length - 1 }
    })
  }

  render() {
    const { open, editIndex, headers } = this.state
    return (
      <div className="http-headers-container">
        <style jsx={true} global={true}>{`
          .http-headers-container .tooltip-container {
            transform: none;
            left: 0;
          }
          .http-headers-container .tooltip-content {
            padding: 0 !important;
          }
        `}</style>
        <style jsx={true}>{`
          .http-headers-container {
            @p: .absolute;
            top: -57px;
            left: 25px;
            z-index: 3;
          }
          .graphiql-button {
            @p: .white50, .bgDarkBlue, .ttu, .f14, .fw6, .br2, .pointer,
              .relative;
            padding: 5px 9px 6px 9px;
          }
          .http-headers-container .list-content {
            @p: .flex, .flexColumn;
            text-transform: none;
            width: 400px;
          }
          .row {
            @p: .flex, .flexRow, .itemsCenter, .bb, .bBlack10, .ph16, .pv10;
          }
          .row.row-inactive {
            @p: .black30, .pointer;
            border: none;
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
        <div className="graphiql-button" onClick={this.handleToggle}>
          Http Headers ({headers.length})
        </div>
        <Tooltip open={open} onClose={this.handleToggle}>
          <div className="list-content">
            {headers.map((header, index) =>
              <div className="row" key={index}>
                <div className="name input">
                  <input
                    name="name"
                    placeholder="Type a name..."
                    value={header.name}
                    onChange={e => this.handleEditChange(e, index)}
                  />
                </div>
                <div className="value input">
                  <input
                    name="value"
                    placeholder="Type the content..."
                    value={header.value}
                    onChange={e => this.handleEditChange(e, index)}
                  />
                </div>
                {header.edited
                  ? <div
                      className="icon"
                      onClick={() => this.handleValidate(index)}
                    >
                      <Icon
                        src={require('graphcool-styles/icons/fill/check.svg')}
                        color={$v.gray40}
                        width={20}
                        height={20}
                      />
                    </div>
                  : <div
                      className="icon"
                      onClick={() => this.handleDelete(index)}
                    >
                      <Icon
                        src={require('graphcool-styles/icons/stroke/cross.svg')}
                        color={$v.gray40}
                        width={10}
                        height={10}
                        stroke={true}
                        strokeWidth={6}
                      />
                    </div>}
              </div>,
            )}
            <div
              className="row row-inactive"
              onClick={this.handleClickNewHeader}
            >
              + add new Header
            </div>
          </div>
        </Tooltip>
      </div>
    )
  }
}

export default HttpHeaders
