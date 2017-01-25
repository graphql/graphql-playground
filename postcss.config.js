module.exports = () => ({
  plugins: {
    'postcss-simple-vars': {
      variables: () => require('graphcool-styles/dist/variables/variables.js'),
    },
    'postcss-inject': {
      cssFilePath: 'node_modules/graphcool-styles/dist/styles.css'
    },
    'postcss-cssnext': {},
    'postcss-inherit': {},
  }
})

