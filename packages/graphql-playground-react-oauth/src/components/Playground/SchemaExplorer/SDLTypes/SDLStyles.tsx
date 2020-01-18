import * as React from 'react'
import { styled } from '../../../../styled'
import { columnWidth } from '../../../../constants'

export const SchemaExplorerContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  padding: 0px 8px 8px 8px;
  background: ${p =>
    p.theme.mode === 'dark' ? p.theme.editorColours.editorBackground : 'white'};
  font-family: ${p => p.theme.settings['editor.fontFamily']};
  font-size: ${p => `${p.theme.settings['editor.fontSize']}px`};
  outline: none !important;
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
  border-right: 1px solid ${p => p.theme.colours.black10};
  overflow: hidden;
`
