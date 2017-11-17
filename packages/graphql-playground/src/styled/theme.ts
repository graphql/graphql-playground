export interface Colours {
  green: string
  black40: string
  paleText: string
  paleGrey: string
}

export const colours: Colours = {
  green: '#27ae60',
  black40: 'rgba(0, 0, 0, 0.4)',

  paleText: 'rgba(0, 0, 0, 0.5)',
  paleGrey: '#f3f4f4', // use for bgs, borders, etc
}

export interface Sizes {
  small6: string
  small12: string
  small16: string
  smallRadius: string
}

export const sizes: Sizes = {
  small6: '6px',
  small12: '12px',
  small16: '16px',

  smallRadius: '2px',
}

export interface Shorthands {
  [x: string]: any
}

export const shorthands: Shorthands = {}

export interface ThemeInterface {
  colours: Colours
  sizes: Sizes
  shorthands: Shorthands
}

export const theme: ThemeInterface = {
  colours,
  sizes,
  shorthands,
}
