const path = require('path')

module.exports = {
  entry: './contentScripts/main.js',
  output: {
    filename: 'contentScript.bundle.js',
    path: path.resolve(__dirname, './')
  },
  mode: 'production'
}
