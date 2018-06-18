import fs from 'fs'
import path from 'path'
import React, { Component, Fragment } from 'react'
import { compose, withState, mapProps } from 'recompose'
import Image from './image'
import Video from './video'
import Sidebar from './sidebar'
import Main from './main'
import Menubar from './menubar'
import Stats from './stats'

const sizeSmall = 350
const sizeMedium = 600

const stringHash = (v) => {
  var hash = 0, i, chr
  if (v.length === 0) return hash
  for (i = 0; i < v.length; i++) {
    chr   = v.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const getMetaData = (metaItemId) => {
  const metaStr = localStorage.getItem(metaItemId)
  return metaStr ? JSON.parse(metaStr) : {}
}

const getGroupsData = (groupsItemId) => {
  const groupsStr = localStorage.getItem(groupsItemId)
  return groupsStr ? JSON.parse(groupsStr) : []
}

class Images extends Component {
  constructor(props) {
    super(props)

    this.menubarRef = React.createRef()
    this.handleOnLoad = this.handleOnLoad.bind(this)
    this.renderMedia = this.renderMedia.bind(this)
    this.renderFinalImages = this.renderFinalImages.bind(this)
    this.updateImagesState = this.updateImagesState.bind(this)
    this.onSelectionFinish = this.onSelectionFinish.bind(this)
    this.onSelectionGroup = this.onSelectionGroup.bind(this)
    this.setFilter = this.setFilter.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.startEditingGroup = this.startEditingGroup.bind(this)
    this.abortGroupEdit = this.abortGroupEdit.bind(this)
    this.removeTagFromMedia = this.removeTagFromMedia.bind(this)
    this.setItemSafe = this.setItemSafe.bind(this)
    this.deleteSelection = this.deleteSelection.bind(this)
    this.resetSession = this.resetSession.bind(this)
    this.handleClick = this.handleClick.bind(this)

    const folderPathHash = stringHash(this.props.folderPath)
    const metaItemId = `meta-${folderPathHash}`
    const groupsItemId = `groups-${folderPathHash}`

    this.setItemSafe('sessionId', folderPathHash)

    const loadedMediasStr = localStorage.getItem('loadedMedias')
    const loadedMedias = (typeof loadedMediasStr !== 'undefined' && loadedMediasStr !== 'null' && loadedMediasStr !== null) ? JSON.parse(loadedMediasStr) : []

    this.state = {
      loaded: loadedMedias.length > 0,
      loadedMedias,
      selection: [],
      meta: this.props.meta,
      groups: this.props.groups,
      filter: {},
      tagSpreading: null,
      isEditingGroup: null,
      withAnimatedOnly: null,
      withStaticOnly: null,
      metaItemId,
      groupsItemId
    }
  }

  setItemSafe (id, value, justWrite = false) {
    const existing = localStorage.getItem(id)
    const nonExistent = typeof existing === 'undefined' || existing === 'null' || existing === null
    if (justWrite || nonExistent) {
      localStorage.setItem(id, value)
    }
  }

  deleteSelection () {
    const { folderPath } = this.props
    const { selection } = this.state
    selection.forEach(file => fs.unlinkSync(path.resolve(folderPath, file)))
    this.resetSession()
  }

  resetSession () {
    localStorage.setItem('loadedMedias', null)
    localStorage.setItem('folderPath', null)
    localStorage.setItem('medias', null)
    this.props.updateShowcaseState({ medias: [], folderPath: null })
    this.setState({ loadedMedias: [], loaded: false })
  }

  handleOnLoad (media, imageState) {
    const isPortrait = (imageState.height - 15) > imageState.width
    const checkMeasure = isPortrait ? imageState.height : imageState.width
    const sizeType = checkMeasure <= sizeSmall ? 'small' : (checkMeasure <= sizeMedium ? 'medium' : 'big')
    const newImageState = { media, isPortrait, sizeType, ...imageState }

    const { loadedMedias } = this.state
    loadedMedias.push(newImageState)
    const loaded = loadedMedias.length === this.props.medias.length

    this.setState({ loadedMedias, loaded })
    if (loaded) {
      this.setItemSafe('loadedMedias', JSON.stringify(loadedMedias), true)
    }
  }

  renderFinalImages () {
    const { medias } = this.props
    let { loadedMedias, filter, meta, groups } = this.state

    if (medias.length < loadedMedias.length) {
      const searchStr = medias.join(',')
      loadedMedias = loadedMedias.filter(s => searchStr.includes(s.media))
    }

    let finalGroups = null
    groups.forEach((group) => {
      const selectionSearch = group.selection.join(',')
      const groupMedias = loadedMedias.filter((imageState) => selectionSearch.includes(imageState.media))
      loadedMedias = loadedMedias.filter((imageState) => !selectionSearch.includes(imageState.media))
      finalGroups = finalGroups !== null ? [...finalGroups, ...groupMedias] : [...groupMedias]
    })

    let activeFilters = Object.keys(filter).filter(key => filter[key])
    if (activeFilters.length) {
      const tagSearch = activeFilters.join(',')
      const hasTag = (media) => {
        const id = stringHash(media)
        const metaData = meta[id]
        if (metaData) {
          return metaData.tags.some((tag) => tagSearch.includes(tag))
        }

        return false
      }
      loadedMedias = loadedMedias.filter((imageState) => hasTag(imageState.media))
      finalGroups = finalGroups.filter((imageState) => hasTag(imageState.media))
    }

    const portraits = loadedMedias.filter(({ isPortrait }) => (
      isPortrait === true
    ))

    const others = (finalGroups || [])
      .concat(loadedMedias.filter(({ isPortrait }) => isPortrait === false))

    return (
      <Fragment>
        <Sidebar>
          {portraits.map((imageState, index) => (
            this.renderMedia(imageState.media, index, 'portraits', imageState)
          ))}
        </Sidebar>
        <Main>
          {others.map((imageState, index) => (
            this.renderMedia(imageState.media, index, 'landscapes', imageState)
          ))}
        </Main>
      </Fragment>
    )
  }

  static isVideo (media) {
    let isVideo = false
    Array.from(['mkv', 'avi', 'mp4']).forEach((extension) => {
      const ext = media.split('.')[1]
      isVideo = ext.includes(extension)
    })

    return isVideo
  }

  updateImagesState (update) {
    return new Promise((resolve) => {
      this.setState(update, () => {
        resolve()
      })
    })
  }

  setFilter (newFilter, checked) {
    const { filter } = this.state
    filter[newFilter] = checked
    this.setState(filter)
  }

  removeTagFromMedia (tag, media) {
    const { metaItemId, meta } = this.state
    const id = stringHash(media)
    meta[id].tags = meta[id].tags.filter(t => t !== tag)
    this.setItemSafe(metaItemId, JSON.stringify(meta), true)
    this.setState({ meta })
  }

  onSelectionFinish (selectionValue) {
    if (selectionValue === '') {
      return
    }

    const { folderPath } = this.props
    const { selection, metaItemId, meta } = this.state
    selection.forEach((entry) => {
      const id = stringHash(entry)
      if (!meta[id]) {
        meta[id] = {
          tags: [selectionValue]
        }
      } else {
        let alreadyExists = meta[id].tags.some((tag) => tag.includes(selectionValue))
        if (!alreadyExists) {
          meta[id].tags.push(selectionValue)
        }
      }
    })

    this.setItemSafe(metaItemId, JSON.stringify(meta), true)
    this.setState({ selection: [], meta })
  }

  handleTagEdit (oldTag, newTag) {
    const { metaItemId, meta } = this.state
    Object.keys(meta).forEach((key) => {
      const metaData = meta[key]
      metaData.tags = metaData.tags.map((tag) => {
        if (tag === oldTag) {
          return newTag
        }

        return tag
      })
      meta[key] = metaData
    })
    this.setItemSafe(metaItemId, JSON.stringify(meta), true)
    this.setState({ meta })
  }

  onSelectionGroup () {
    const { selection, groupsItemId, groups, isEditingGroup } = this.state
    const groupId = isEditingGroup !== null ? isEditingGroup : stringHash(selection.join(','))
    let alreadyExists = groups.some((group) => group.id === groupId)

    if (isEditingGroup !== null) {
      groups.forEach((group, index) => {
        if (group.id === groupId) {
          groups[index].selection = group.selection.concat(selection)
        }
      })
    } else if (!alreadyExists) {
      groups.push({
        id: groupId,
        selection
      })
    }

    this.setItemSafe(groupsItemId, JSON.stringify(groups), true)
    this.setState({ selection: [], groups, isEditingGroup: null })
  }

  startEditingGroup (groupId) {
    this.setState({ isEditingGroup: groupId })
  }

  abortGroupEdit () {
    this.setState({ isEditingGroup: null })
  }

  renderMedia (media, index, keyType = 'default', isFinal = false) {
    const { folderPath } = this.props
    const { selection, meta, groups } = this.state
    const id = stringHash(media)
    const isSelected = selection.some((entry) => media === entry)

    let groupId = null
    const isInGroup = groups.some(({ selection }) => {
      const inGroup = selection.some(entry => entry === media)
      if (inGroup) {
        groupId = stringHash(selection.join(','))
      }
      return inGroup
    })

    const injectedProps = {
      metaData: meta[id],
      groupId,
      isSelected,
      media,
      handleClick: this.handleClick,
      onLoad: this.handleOnLoad,
      isEditingGroup: this.state.isEditingGroup,
      startEditingGroup: this.startEditingGroup,
      removeTagFromMedia: this.removeTagFromMedia,
      isFinal: isFinal
    }

    if (Images.isVideo(media)) {
      return <Video key={`images-${keyType}-${index}`} src={`file:///${folderPath}/${media}`} alt='' {...injectedProps} />
    }

    return <Image key={`images-${keyType}-${index}`} src={`file:///${folderPath}/${media}`} alt='' {...injectedProps} />
  }

  async handleClick (event) {
    const { selection, isEditingGroup, isSelecting, tagSpreading } = this.state

    if (isEditingGroup && event.target.className.includes('in-group')) {
      return
    }

    const media = event.target.attributes.media.nodeValue

    if (tagSpreading) {
      await this.setState({ selection: [media] })
      return this.onSelectionFinish(tagSpreading)
    }

    let alreadyExists = false
    selection.forEach((entry) => {
      if (entry === media) {
        alreadyExists = true
      }
    })

    if (!alreadyExists) {
      selection.push(media)
      this.setState({ selection })
    } else {
      const filtered = selection.filter((entry) => entry !== media)
      this.setState({ selection: filtered })
    }
  }

  render () {
    const { medias, folderPath, setAnimatedOnly, setStaticOnly } = this.props
    const { loaded, loadedMedias, selection, meta, withAnimatedOnly, withStaticOnly, tagSpreading } = this.state
    return (
      <Fragment>
        {
          loaded &&
          <div>
            <Stats numOfFilesLoaded={medias.length} resetSession={this.resetSession} />
            {this.renderFinalImages()}
            <Menubar
              ref={this.menubarRef}
              tagSpreading={tagSpreading}
              folderPath={folderPath}
              setFilter={this.setFilter}
              handleTagEdit={this.handleTagEdit}
              isEditingGroup={this.state.isEditingGroup}
              abortGroupEdit={this.abortGroupEdit}
              deleteSelection={this.deleteSelection}
              setAnimatedOnly={setAnimatedOnly}
              withAnimatedOnly={withAnimatedOnly}
              setStaticOnly={setStaticOnly}
              withStaticOnly={withStaticOnly}
              meta={meta}
              isVideo={Images.isVideo}
              onSelectionFinish={this.onSelectionFinish}
              onSelectionGroup={this.onSelectionGroup}
              loadedMedias={loadedMedias}
              selection={selection}
              updateShowcaseState={this.props.updateShowcaseState}
              updateImagesState={this.updateImagesState}
            />
          </div>
        }

        {
          !loaded &&
          <Fragment>
            <h2>loading images..</h2>
            <article>
              {medias.map((media, index) => this.renderMedia(media, index))}
            </article>
          </Fragment>
        }

        <style jsx>{`
          article {
            opacity: .1;
          }
        `}</style>
      </Fragment>
    )
  }
}

export default compose(
  withState('animatedOnly', 'setAnimatedOnly', false),
  withState('staticOnly', 'setStaticOnly', false),
  mapProps(({ medias, animatedOnly, setAnimatedOnly, staticOnly, setStaticOnly, ...props }) => {
    const folderPathHash = stringHash(props.folderPath)
    const metaItemId = `meta-${folderPathHash}`
    const groupsItemId = `groups-${folderPathHash}`
    const meta = getMetaData(metaItemId)
    const groups = getGroupsData(groupsItemId)

    let finalMedias = [...medias]
    if (animatedOnly) {
      finalMedias = finalMedias.filter(m => {
        const ext = m.split('.')[1]
        return Images.isVideo(m) || ext.includes('gif')
      })
    }

    if (staticOnly) {
      finalMedias = finalMedias.filter(m => {
        const ext = m.split('.')[1]
        return !Images.isVideo(m) && !ext.includes('gif')
      })
    }

    return {
      ...props,
      medias: finalMedias,
      meta,
      groups,
      animatedOnly,
      setAnimatedOnly,
      staticOnly,
      setStaticOnly
    }
  })
)(Images)
