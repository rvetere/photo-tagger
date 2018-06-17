const path = require('path')
const express = require('express')

module.exports = function (isDev) {
  return new Promise((resolve, reject) => {
    if (isDev) {
      return resolve()
    }

    const app = express()

    const staticPath = path.resolve(__dirname, '..', 'renderer', 'out')
    app.use(express.static(staticPath))

    app.listen(8023, function() {
      console.log(`app listening on port ${8023}!`)
      resolve()
    })
  })
}