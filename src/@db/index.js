const mongoose =  require('mongoose')
const config = require('../@config')

function getDbConnectionUrl () {
  const defaultUrl = process.env.DATABASE ? (process.env.DATABASE) : config.database
  return process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/sb-owncloud-test' : defaultUrl
}

function connectDb () {
  return new Promise((resolve) => {
    // Use promises for mongoose async operations.
    mongoose.Promise = Promise;
    mongoose.connect(getDbConnectionUrl(), {
      server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
    })

    mongoose.connection.on('connected', () => {
      global.dbConnected = true
      console.log(`Mongoose default connection open to ${getDbConnectionUrl()}`)
      resolve()
    })

    mongoose.connection.on('error', (err) => {
      global.dbConnected = false
      console.log(`Mongoose default connection error: ${err}`)
      resolve()
    })

    mongoose.connection.on('disconnected', () => {
      global.dbConnected = false
      console.log('Mongoose default connection disconnected')
      resolve()
    })

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
      mongoose.connection.close(function () {
        global.dbConnected = false
        console.log('Mongoose default connection disconnected through app termination')
        process.exit(0)
      })
    })
  })
}

module.exports = {
  connectDb: connectDb
}
