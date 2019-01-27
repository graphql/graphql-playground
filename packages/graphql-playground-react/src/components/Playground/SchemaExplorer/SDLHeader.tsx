import * as React from 'react'
import { styled } from '../../../styled'
import { Button } from '../TopBar/TopBar'
import { GraphQLSchema } from 'graphql'
import { downloadSchema } from '../util/createSDL'

interface SDLHeaderProps {
  schema: GraphQLSchema
}

interface State {
  open: boolean
}

export default class SDLHeader extends React.Component<SDLHeaderProps, State> {
  ref
  private node: any
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node.contains(e.target)) {
      return
    }
    return this.setState({
      open: false,
    })
  }

  showOptions = () => {
    this.setState({
      open: !this.state.open,
    })
  }

  printSDL = () => {
    return downloadSchema(this.props.schema, 'sdl')
  }

  printIntrospection = () => {
    return downloadSchema(this.props.schema, 'json')
  }

  setRef = ref => {
    this.node = ref
  }

  render() {
    const { open } = this.state
    return (
      <SchemaHeader ref={this.setRef}>
        <Title>Schema</Title>
        <Box>
          <Download onClick={this.showOptions} open={open}>
            Download
          </Download>
          {open && (
            <React.Fragment>
              <Option onClick={this.printIntrospection}>JSON</Option>
              <Option onClick={this.printSDL}>SDL</Option>
            </React.Fragment>
          )}
        </Box>
      </SchemaHeader>
    )
  }
}

const SchemaHeader = styled.div`
  display: flex;
  flex-direction: row;
  height: 64px;
  width: 100%;
  margin-right: 108px;
  align-items: center;
  justify-content: flex-start;
  outline: none;
  user-select: none;
`

const Box = styled.div`
  position: absolute;
  top: 16px;
  right: 2em;
  width: 108px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
`

const Title = styled.div`
  color: ${p => styleHelper(p).title};
  cursor: default;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase !important;
  font-family: 'Open Sans', sans-serif !important;
  letter-spacing: 1px;
  user-select: none !important;
  padding: 16px;
  padding-right: 5px;
`

const Download = styled(Button)`
  flex: 1;
  color: ${p => styleHelper(p).download['text']};
  background: ${p => styleHelper(p).download['button']};
  height: 32px;
  border-radius: 2px;
  &:hover {
    color: ${p => styleHelper(p).buttonTextHover};
    background-color: ${p => styleHelper(p).buttonHover};
  }
`

const Option = styled(Download)`
  text-align: left;
  width: 100%;
  margin-left: 0px;
  border-radius: 0px;
  z-index: 2000;
  background: ${p => styleHelper(p).button};
`

const styleHelper = p => {
  if (p.theme.mode === 'dark') {
    return {
      title: 'white',
      subtitle: '#8B959C',
      download: {
        text: p.open ? '#8B959C' : 'white',
        button: p.theme.colours.darkBlue,
      },
      buttonText: 'white',
      button: p.theme.colours.darkBlue,
      buttonHover: '#2B3C48',
      buttonTextHover: 'white',
    }
  }
  return {
    title: p.theme.colours.darkBlue,
    subtitle: 'rgba(61, 88, 102, 0.5)',
    download: {
      text: p.open ? 'rgba(61, 88, 102, 0.5)' : p.theme.colours.darkBlue,
      button: '#f6f6f6',
    },
    buttonText: p.theme.colours.darkBlue,
    button: '#f6f6f6',
    buttonHover: '#EDEDED',
    buttonTextHover: p.theme.colours.darkBlue,
  }
}
