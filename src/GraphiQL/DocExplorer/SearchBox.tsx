/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import debounce from 'graphiql/dist/utility/debounce'
import {Icon} from 'graphcool-styles'

interface Props {
  isShown: boolean
  onSearch: (value: string) => void
}

interface State {
  value: string
}

export default class SearchBox extends React.Component<Props, State> {
  _debouncedOnSearch: any

  constructor(props) {
    super(props)

    this.state = { value: '' }

    this._debouncedOnSearch = debounce(200, () => {
      this.props.onSearch(this.state.value)
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isShown !== this.props.isShown ||
      nextState.value !== this.state.value
  }

  render() {
    return (
      <div className='root'>
        <style jsx={true}>{`
          .root {
            @inherit: .pa25;
            background-color: rgba(0,0,0,.02);
          }
          .label {
            @inherit: .bgWhite, .bbox, .w100, .flex, .itemsCenter;
            padding: 12px 14px 13px 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,.1);
          }
          .input {
            @inherit: .f16, .ml10;
          }
        `}</style>
        {
          this.props.isShown &&
            <label className='label'>
              <Icon src={require('graphcool-styles/icons/stroke/search.svg')} stroke={true} strokeWidth={3} />
              <input
                className='input'
                onChange={this.handleChange}
                type='text'
                value={this.state.value}
                placeholder='Search the schemaa ...'
              />
            </label>
        }
      </div>
    )
  }

  handleChange = event => {
    this.setState({ value: event.target.value })
    this._debouncedOnSearch()
  }
}
