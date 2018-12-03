import * as React from 'react'
import { styled } from '../../../../styled'
import { Button } from '../../TopBar/TopBar'
import { GraphQLSchema } from 'graphql'
import { downloadSchema } from '../../util/createSDL'
import { columnWidth } from '../../../../constants'

interface SDLHeaderProps {
	schema: GraphQLSchema
}

interface State {
	open: boolean
}

class SDLHeader extends React.Component<SDLHeaderProps, State> {
	constructor(props) {
		super(props)
		this.state = {
			open: false,
		}
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

	render() {
		const { open } = this.state
		return (
			<SchemaHeader>
				<Title>Schema</Title>
				<Box>
					<Download onClick={this.showOptions} open={open}>
						Download
					</Download>
					{open && (
						<React.Fragment>
							<Option alternate={true} onClick={this.printIntrospection}>
								JSON
							</Option>
							<Option alternate={false} onClick={this.printSDL}>
								SDL
							</Option>
						</React.Fragment>
					)}
				</Box>
			</SchemaHeader>
		)
	}
}

export { SDLHeader }
export const SchemaExplorerContainer = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	align-items: stretch;
	padding: 8px;
	background: ${(p) => styleHelper(p).secBackground};
	font-family: ${(p) => p.theme.settings['editor.fontFamily']};
	font-size: ${(p) => `${p.theme.settings['editor.fontSize']}px`};
	outline: none !important;
`

const SchemaHeader = styled.div`
	display: flex;
	height: 64px;
	width: 100%;
	align-items: center;
	justify-content: space-between;
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
	flex: 1;
	color: ${(p) => styleHelper(p).title};
	cursor: default;
	font-size: 14px;
	font-weight: 600;
	text-transform: uppercase !important;
	font-family: 'Open Sans', sans-serif !important;
	letter-spacing: 1px;
	user-select: none;
	padding: 16px;
`

const Download = styled(Button)`
	flex: 1;
	color: ${(p) => styleHelper(p).download['text']};
	background: ${(p) => styleHelper(p).download['button']};
	padding: 12px 9px 12px 9px;
	border-radius: 0px;
	&:hover {
		color: ${(p) => styleHelper(p).buttonTextHover};
		background-color: ${(p) => styleHelper(p).buttonHover};
	}
`

const Option = styled(Download)`
	text-align: left;
	width: 100%;
	margin-left: 0px;
	border-radius: 0px;
	z-index: 2000;
	background: ${(p) => styleHelper(p).button};
`

export interface SDLColumnProps {
	children: any
	width?: number
}

const SDLColumn = ({ children, width = columnWidth }: SDLColumnProps) => {
	return <Column style={{ width }}>{children}</Column>
}

export { SDLColumn }

const Column = styled<SDLColumnProps, 'div'>('div')`
	display: flex;
	flex: 1 0 auto;
	flex-flow: column;
	padding-bottom: 20px;
	border-right: 1px solid ${(p) => p.theme.colours.black10};
	overflow: hidden;
`

const styleHelper = (p) => {
	if (p.theme.mode === 'dark') {
		return {
			secBackground: p.theme.editorColours.navigationBar,
			title: 'white',
			download: {
				text: p.open ? p.theme.colours.white30 : 'white',
				button: p.open ? '#2e5482' : p.theme.colours.blue,
			},
			buttonText: 'white',
			button: p.alternate ? '#386bac' : p.theme.colours.blue,
			buttonHover: '#2e5482',
			buttonTextHover: 'white',
		}
	}
	return {
		secBackground: 'white',
		download: {
			text: p.open ? 'rgba(61, 88, 102, 0.5)' : '#3D5866',
			button: '#f6f6f6',
		},
		title: 'rgba(0, 0, 0, 0.3)',
		buttonText: '#3d5866',
		button: p.alternate ? '#EDEDED' : '#f6f6f6',
		buttonHover: '#f6f6f6',
		buttonTextHover: 'rgba(61, 88, 102, 0.5)',
	}
}
