const { version } = require('../package.json')

module.exports = (args) => {
  console.log(`Version is v${version}`)
}