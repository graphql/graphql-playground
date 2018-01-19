export interface Colours {
  green: string
  darkBlue: string
  darkBlue50: string
  darkBlue60: string
  darkBlue80: string
  darkBlue30: string
  darkBlue20: string
  darkBlue10: string
  darkerBlue: string
  darkestBlue: string
  white70: string
  white60: string
  white30: string
  white20: string
  white10: string
  white: string
  black40: string
  paleText: string
  paleGrey: string
}

export const colours: Colours = {
  green: '#27ae60',
  darkBlue: 'rgb(23, 42, 58)',
  darkBlue50: 'rgba(23, 42, 58, 0.5)',
  darkBlue80: 'rgba(23, 42, 58, 0.8)',
  darkBlue60: 'rgba(23, 42, 58, 0.6)',
  darkBlue30: 'rgba(23, 42, 58, 0.3)',
  darkBlue20: 'rgba(23, 42, 58, 0.2)',
  darkBlue10: 'rgba(23, 42, 58, 0.1)',
  darkerBlue: '#0F202D',
  darkestBlue: 'rgb(11,20,28)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white: 'rgba(255, 255, 255, 1)',
  black40: 'rgba(0, 0, 0, 0.4)',

  paleText: 'rgba(0, 0, 0, 0.5)',
  paleGrey: '#f3f4f4', // use for bgs, borders, etc
}

export interface Sizes {
  small6: string
  small10: string
  small12: string
  small16: string
  medium25: string
  smallRadius: string
  fontLight: string
  fontSemiBold: string
  fontTiny: string
  fontSmall: string
  fontMedium: string
}

export const sizes: Sizes = {
  small6: '6px',
  small10: '10px',
  small12: '12px',
  small16: '16px',

  medium25: '25px',

  // font weights
  fontLight: '300',
  fontSemiBold: '600',

  // font sizes
  fontTiny: '12px',
  fontSmall: '14px',
  fontMedium: '20px',

  // others
  smallRadius: '2px',
}

export interface Shorthands {
  [x: string]: any
}

export const shorthands: Shorthands = {}

export interface ThemeInterface {
  mode: 'light' | 'dark'
  colours: Colours
  sizes: Sizes
  shorthands: Shorthands
}

export const theme: ThemeInterface = {
  mode: 'dark',
  colours,
  sizes,
  shorthands,
}
