export interface Colours {
  green: string
  black40: string
}

export interface ThemeInterface {
  colours: Colours
}

export const colours: Colours = {
  green: '#27ae60',
  black40: 'rgba(0, 0, 0, 0.4)',
}

export const theme: ThemeInterface = {
  colours,
}
