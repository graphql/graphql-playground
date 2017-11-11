import withTheme from './withTheme'
import ThemeProvider from './ThemeProvider'

type ThemeType = 'dark' | 'light'

interface ThemeInterface {
  localTheme: ThemeType
}

interface OptionalThemeInterface {
  localTheme?: ThemeType
}

export {
  withTheme,
  ThemeProvider,
  ThemeType,
  ThemeInterface,
  OptionalThemeInterface,
}
