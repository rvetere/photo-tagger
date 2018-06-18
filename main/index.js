
// Native
const { format } = require('url')

// Packages
const { BrowserWindow, app } = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const { resolve } = require('app-root-path')
const server = require('./server')

// const connectDb = require('../src/@db').connectDb

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#333',
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: false
    }
  })

  const devPath = 'http://localhost:8000/start'
  const prodPath = 'http://localhost:8023/start/index.html'

  // await connectDb()
  await server(isDev)

  process.on('SIGINT', function () {
    const sessionId = localStorage.getItem('currentSession')
    console.log('PRINT MEDIA:', localeStorage.getItem(`meta-${sessionId}`))
    console.log('PRINT GROUPS:', localeStorage.getItem(`groups-${sessionId}`))
  })

  global.isDev = isDev

  const url = isDev ? devPath : prodPath
  mainWindow.loadURL(url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)
