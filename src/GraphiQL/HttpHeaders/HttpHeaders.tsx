import * as React from 'react'
import Tooltip from 'graphcool-tmp-ui/lib/Tooltip'
import { Icon, $v } from 'graphcool-styles'
import HttpListItem from './HttpListItem'

export interface Header {
  name: string
  value: string
}

export interface Props {
  headers?: Header[]
  onChange?: (headers: Header[]) => void
}

export interface State {
  open: boolean
  newHeader: boolean
}

class HttpHeaders extends React.Component<Props, State> {
  static defaultProps = {
    headers: [],
  }

  private lastItemRef: any

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      newHeader: false,
    }
  }

  render() {
    const { headers } = this.props
    const { open, newHeader } = this.state
    return (
      <div className="http-headers-container">
        <style jsx={true} global={true}>{`
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
        `}</style>
        <div className="graphiql-button" onClick={this.handleToggle}>
          Http Headers ({(headers && headers.length) || 0})
        </div>
        <Tooltip
          open={open}
          onClose={this.handleToggle}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <div className="list-content">
            {headers &&
              headers.map((header, index) =>
                <HttpListItem
                  key={index}
                  index={index}
                  header={header}
                  onChange={this.handleChange}
                  onDelete={this.handleDelete}
                />,
              )}
            {newHeader &&
              <HttpListItem
                index={-1}
                header={{ name: '', value: '' }}
                onChange={this.handleChange}
                onDelete={this.handleDelete}
              />}
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

  private handleToggle = () => {
    this.setState({ open: !this.state.open })
  }

  private handleClickNewHeader = () => {
    this.setState({ newHeader: true })
  }

  private handleChange = (index: number, header: Header) => {
    let { headers } = this.props
    if (headers) {
      // If new item add it at the end of the array
      if (index === -1) {
        headers = [...headers, header]
      } else {
        headers[index] = header
      }
      if (this.props.onChange) {
        this.props.onChange(headers)
      }
    }
    this.setState({ newHeader: false })
  }

  private handleDelete = (index: number) => {
    // If delete new item
    if (index === -1) {
      this.setState({ newHeader: false })
      return
    }
    const { headers } = this.props
    if (headers) {
      headers.splice(index, 1)
      if (this.props.onChange) {
        this.props.onChange(headers)
      }
    }
  }
}

export default HttpHeaders
