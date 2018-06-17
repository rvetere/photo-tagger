import { Component, Fragment } from 'react'
import {
  compose,
  lifecycle,
  withState,
  withHandlers,
  branch,
  renderComponent
} from 'recompose'

const withGlobalsState = withState('globals', 'setGlobals', {})

const withLifecycle = lifecycle({
  componentDidMount () {
    const { getGlobal } = require('electron').remote
    const dbConnected = getGlobal('dbConnected')
    const isDev = getGlobal('isDev')

    this.props.setGlobals({
      isDev,
      dbConnected,
      locale: navigator.language.split('-')[0]
    })
  }
})

const withRenderGlobals = withHandlers({
  renderGlobals: ({ globals }) => () => Object.keys(globals).map(key => <li key={key}>{key}: {globals[key].toString()}</li>)
})

const withUpdateGlobals = withHandlers({
  updateGlobals: ({ globals, setGlobals }) => (update) => setGlobals({
    ...globals,
    ...update
  })
})
class Loading extends Component {
  componentDidMount () {
    // open dev-tools in production
    const { globalShortcut, BrowserWindow } = require('electron').remote
    globalShortcut.register('CommandOrControl+Shift+K', () => {
      BrowserWindow.getFocusedWindow().webContents.openDevTools()
    })

    window.addEventListener('beforeunload', () => {
      globalShortcut.unregisterAll()
    })
  }

  render () {
    return (
      <Fragment>
        <h2>loading...</h2>
      </Fragment>
    )
  }
}

const onlyRenderWhenGlobalsAreSet = branch(
  ({ globals }) => Object.keys(globals).length === 0 || !globals.locale,
  renderComponent(Loading)
)

export default WithGlobals => compose(
  withGlobalsState,
  withLifecycle,
  withRenderGlobals,
  withUpdateGlobals,
  onlyRenderWhenGlobalsAreSet
)(WithGlobals)
