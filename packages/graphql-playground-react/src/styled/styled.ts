import * as styledComponents from 'styled-components'
import { ThemedStyledComponentsModule } from 'styled-components' // tslint:disable-line

import { ThemeInterface, theme } from './theme'

const withProps = <U>() => <P, T, O>(
  fn: styledComponents.ThemedStyledFunction<P, T, O>,
) => fn as styledComponents.ThemedStyledFunction<P & U, T, O & U>

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as ThemedStyledComponentsModule<ThemeInterface>

export { css, injectGlobal, keyframes, ThemeProvider, theme, withProps }
export default styled
