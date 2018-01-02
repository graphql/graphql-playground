// import * as styledComponents from 'styled-components'
import { default as styled, css, injectGlobal, keyframes, ThemeProvider  } from 'styled-components'

import {  theme } from './theme'

// const {
//   default: styled,
//   css,
//   injectGlobal,
//   keyframes,
//   ThemeProvider,
// } = styledComponents as ThemedStyledComponentsModule<ThemeInterface>

export { css, injectGlobal, keyframes, ThemeProvider, theme }
export default styled
