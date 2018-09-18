module.exports = ctx => ({
  plugins: [
    require('postcss-cssnext')(),
    require('postcss-inherit')({
      globalStyles: 'node_modules/graphcool-styles/dist/styles.css',
      propertyRegExp: /^(inherit|extend|p)s?:?$/i
    })
  ]
})
