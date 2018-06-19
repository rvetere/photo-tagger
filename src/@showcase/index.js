import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Images from './images'

const SUB_FOLDER_SUPPORT = false

export default class ShowCase extends Component {
  constructor(props) {
    super(props)

    this.updateShowcaseState = this.updateShowcaseState.bind(this)
    this.setItemSafe = this.setItemSafe.bind(this)
    this.walkSync = this.walkSync.bind(this)
    this.getMedias = this.getMedias.bind(this)
    this.getMoveToFolder = this.getMoveToFolder.bind(this)
    this.openFolder = this.openFolder.bind(this)

    const folderPath = localStorage.getItem('folderPath')

    let initialMedias = []
    if (folderPath && folderPath !== 'null' && folderPath !== null) {
      initialMedias = this.walkSync(folderPath)
    }

    this.state = {
      folderPath: folderPath || null,
      medias: initialMedias
    }
  }

  setItemSafe (id, value, justWrite = false) {
    const existing = localStorage.getItem(id)
    const nonExistent = typeof existing === 'undefined' || existing === 'null' || existing === null
    if (justWrite || nonExistent) {
      localStorage.setItem(id, value)
    }
  }

  walkSync (dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      const isDir = fs.statSync(dir + '/' + file).isDirectory()
      if (isDir && SUB_FOLDER_SUPPORT) {
        filelist = this.walkSync(dir + '/' + file + '/', filelist);
      } else if (!isDir) {
        filelist.push(file);
      }
    });
    return filelist;
  }

  getMedias (fileNames) {
    const folderPath = fileNames.pop()
    const filelist = this.walkSync(folderPath)
    let update = { folderPath, medias: filelist }

    this.setState(update)
    this.setItemSafe('folderPath', folderPath)
  }

  getMoveToFolder (callback) {
    const { dialog } = require('electron').remote

    const filters = [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
    const properties = ['openDirectory']
    dialog.showOpenDialog({ filters, properties }, (fileNames) => {
      if (fileNames === undefined) return
      callback(fileNames.pop())
     })
  }

  openFolder () {
    const { dialog } = require('electron').remote

    const filters = [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
    const properties = ['openDirectory']
    dialog.showOpenDialog({ filters, properties }, (fileNames) => {
      if (fileNames === undefined) return
      this.getMedias(fileNames)
     })
  }

  updateShowcaseState (update) {
    this.setState(update)
  }

  render () {
    const { medias, folderPath } = this.state
    return (
      <div>
        {
          medias.length === 0 &&
          <button onClick={this.openFolder}>
            <FormattedMessage id='@showcase.index.openFolder' defaultMessage='Open Folder' />
          </button>
        }
        {
          medias.length > 0 &&
          <Images getMoveToFolder={this.getMoveToFolder} updateShowcaseState={this.updateShowcaseState} folderPath={folderPath} medias={medias} />
        }
      </div>
    )
  }
}
