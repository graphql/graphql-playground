import * as React from 'react'
import debounce from 'graphiql/dist/utility/debounce'
import { Search } from '../../Icons'
import { styled } from '../../../styled'

export interface Props {
  onSearch: (value: string) => void
  placeholder?: string
  clean?: boolean
}

export interface State {
  value: string
}

export default class SearchBox extends React.Component<Props, State> {
  private debouncedOnSearch: any

  constructor(props) {
    super(props)

    this.state = { value: '' }

    this.debouncedOnSearch = debounce(200, () => {
      this.props.onSearch(this.state.value)
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.value !== this.state.value
  }

  render() {
    const LabelComponent = (
      <Label>
        <Search
          height={16}
          width={16}
          strokeWidth={3}
          color={'rgba(0, 0, 0, 0.3)'}
        />
        <Input
          onChange={this.handleChange}
          type="text"
          value={this.state.value}
          placeholder={this.props.placeholder || 'Search the docs ...'}
        />
      </Label>
    )
    if (this.props.clean) {
      return LabelComponent
    }

    return <SearchContainer>{LabelComponent}</SearchContainer>
  }

  handleChange = event => {
    this.setState({ value: event.target.value })
    this.debouncedOnSearch()
  }
}

const SearchContainer = styled.div`
  position: relative;
  flex: 0 0 auto;
  z-index: 1;
  display: flex;
  margin-left: 6px;
  padding: 25px;
  background: ${p => p.theme.colours.black02};
  border-bottom: 1px solid ${p => p.theme.colours.black10};
  div {
    width: 100%;
  }
`

const Label = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 12px 14px 13px 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: ${p => p.theme.colours.white};
`

const Input = styled.input`
  font-size: 16px;
  margin-left: 10px;
  &::placeholder {
    color: ${p => p.theme.colours.black30};
  }
`
