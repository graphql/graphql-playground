module.exports = () => ({
  plugins: {
    'postcss-simple-vars': {
      variables: () => require('./variables'),
    },
    'postcss-inject': {
      cssFilePath: './style.css'
    },
    'postcss-cssnext': {},
    'postcss-inherit': {},
  }
})
