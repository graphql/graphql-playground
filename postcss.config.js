module.exports = () => ({
  plugins: {
    'postcss-inject': {
      cssFilePath: './style.css'
    },
    'postcss-cssnext': {},
    'postcss-inherit': {},
  }
})
