import * as styledComponents from 'styled-components'
import { ThemedStyledComponentsModule } from 'styled-components' // tslint:disable-line

import { ThemeInterface, theme } from './theme'

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as ThemedStyledComponentsModule<ThemeInterface>

const withProps = <U>() => <P, T, O>(
  fn: styledComponents.ThemedStyledFunction<P, T, O>,
) => fn as styledComponents.ThemedStyledFunction<P & U, T, O & U>

export {
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  theme,
  ThemeInterface,
  withProps,
}
export default styled
