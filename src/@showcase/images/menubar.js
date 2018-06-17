import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import Image from './image'
import Video from './video'

export default class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.inputRef = React.createRef()
    this.renderMedia = this.renderMedia.bind(this)
    this.finishSelection = this.finishSelection.bind(this)
    this.groupSelection = this.groupSelection.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.editTagName = this.editTagName.bind(this)
    this.spreadTag = this.spreadTag.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.handleMediaClick = this.handleMediaClick.bind(this)

    this.state = {
      isSelecting: false,
      tagEditing: {},
      tagSpreading: null
    }
  }

  finishSelection () {
    const selectionValue = this.inputRef.current.value
    this.props.onSelectionFinish(selectionValue)
    this.setState({ isSelecting: false })
  }

  groupSelection () {
    this.props.onSelectionGroup()
    this.setState({ isSelecting: false })
  }

  handleMediaClick (event) {
    event.preventDefault()
    const media = event.target.attributes.media.nodeValue
    const filtered = this.props.selection.filter((entry) => entry !== media)
    this.setState({ isSelecting: filtered.length > 0 })
    this.props.updateImagesState({ selection: filtered })
  }

  async handleClick (event) {
    const { selection, isEditingGroup } = this.props
    const { isSelecting, tagSpreading } = this.state

    if (isEditingGroup && event.target.className.includes('in-group')) {
      return
    }

    if (!isSelecting && !tagSpreading) {
      this.setState({ isSelecting: true })
    }

    const media = event.target.attributes.media.nodeValue

    if (tagSpreading) {
      await this.props.updateImagesState({ selection: [media] })
      return this.props.onSelectionFinish(tagSpreading)
    }

    let alreadyExists = false
    selection.forEach((entry) => {
      if (entry === media) {
        alreadyExists = true
      }
    })

    if (!alreadyExists) {
      selection.push(media)
      this.props.updateImagesState({ selection })
    } else {
      const filtered = selection.filter((entry) => entry !== media)
      this.setState({ isSelecting: filtered.length > 0 })
      this.props.updateImagesState({ selection: filtered })
    }
  }

  async handleChange (event) {
    const filter = event.target.name
    if (filter === 'animated-only') {
      this.props.setAnimatedOnly(event.target.checked)
      await this.props.updateImagesState({ withAnimatedOnly: event.target.checked })
      return
    }
    this.props.setFilter(filter, event.target.checked)
  }

  renderMedia (media, index, isFinal = {}) {
    const { folderPath } = this.props

    if (this.props.isVideo(media)) {
      return <Video noControls key={`selection-media-${index}`} src={`file:///${folderPath}/${media}`} alt='' media={media} isFinal={isFinal} />
    }

    return <Image key={`selection-media-${index}`} src={`file:///${folderPath}/${media}`} alt='' media={media} isFinal={isFinal} />
  }

  editTagName (tag, index) {
    const { tagEditing } = this.state
    tagEditing[index] = true
    this.setState({ tagEditing })
  }

  spreadTag (tag) {
    if (this.props.isEditingGroup) {
      return console.warn('exit group editing first')
    }

    let { tagSpreading } = this.state
    tagSpreading = tag
    this.setState({ tagSpreading })
  }

  handleTagEdit (event, index) {
    if (event.keyCode === 13) {
      const { tagEditing } = this.state
      const newTag = event.target.value
      const oldTag = event.target.name
      this.props.handleTagEdit(oldTag, newTag)
      tagEditing[index] = false
      this.setState({ tagEditing  })
    }
  }

  componentDidMount () {
    setTimeout(, 500)
  }

  componentWillUnmount () {
    const allTags = Array.from(document.getElementsByTagName('img')).concat(Array.from(document.getElementsByTagName('video')))
    allTags.forEach((tag) => tag.removeEventListener('click', this.handleClick))
  }

  render () {
    const { meta, selection, folderPath, isEditingGroup } = this.props
    const { isSelecting, tagEditing, tagSpreading } = this.state

    const tags = []
    Object.keys(meta).forEach((key) => {
      const metaData = meta[key]
      metaData.tags.forEach((tag) => {
        const alreadyExists = tags.some(t => t === tag)
        !alreadyExists && tags.push(tag)
      })
    })

    return (
      <article>
        <button onDoubleClick={this.props.resetSession}>
          <FormattedMessage id='@showcase.images.menuBar.resetSession' defaultMessage='Reset Session' />
        </button>


        {tags.length > 0 && <hr />}

        <div className='tag-filters'>
          {Array.from(['animated-only']).concat(tags).map((tag, index) => {
            const isTagEditing = tagEditing[index] && index > 0
            return (
              <div key={index} className='filter'>
                {!isTagEditing &&
                <Fragment>
                  <label>
                    <input name={tag} onChange={this.handleChange} type='checkbox' />
                    {tag}
                  </label>
                  {index > 0 &&
                  <Fragment>
                    {' '}
                    <button className='edit-button' onClick={() => { this.editTagName(tag, index) }}>
                      <FormattedMessage id='@showcase.images.menuBar.editTagName' defaultMessage='E' />
                    </button>
                    {' '}
                    <button className='edit-button' disabled={tagSpreading !== null} onClick={() => { this.spreadTag(tag) }}>
                      <FormattedMessage id='@showcase.images.menuBar.spreadTag' defaultMessage='+' />
                    </button>
                  </Fragment>}
                </Fragment>}

                {isTagEditing &&
                <input name={tag} defaultValue={tag} onKeyUp={(event) => { this.handleTagEdit(event, index) }} type='text' />}
              </div>
            )
          })}
        </div>

        {(isSelecting && !isEditingGroup) &&
        <Fragment>
          <hr />
          <input ref={this.inputRef} type='text' name='selectionValue' />
          <button onClick={this.finishSelection}>
            <FormattedMessage id='@showcase.images.menuBar.finishSelection' defaultMessage='Tag' />
          </button>
          {' '}
          <button onClick={this.groupSelection}>
            <FormattedMessage id='@showcase.images.menuBar.groupSelection' defaultMessage='Group' />
          </button>
          {' '}
          <button onClick={this.props.deleteSelection}>
            <FormattedMessage id='@showcase.images.menuBar.' defaultMessage='Delete' />
          </button>
        </Fragment>}

        {isEditingGroup &&
        <Fragment>
          <hr />
          <button onClick={this.props.abortGroupEdit}>
            <FormattedMessage id='@showcase.images.menuBar.abortGroupEdit' defaultMessage='Abort' />
          </button>
          {isSelecting &&
            <Fragment>
              {' '}
              <button onClick={this.props.onSelectionGroup}>
                <FormattedMessage id='@showcase.images.menuBar.editGroup' defaultMessage='Add to group' />
              </button>
            </Fragment>}
        </Fragment>}

        {(!isEditingGroup && tagSpreading) &&
        <Fragment>
          <hr />
          <button onClick={() => this.setState({ tagSpreading: null })}>
            <FormattedMessage id='@showcase.images.menuBar.abortTagSpreading' defaultMessage='Stop spreading' />
          </button>
        </Fragment>}

        <hr />

        <div
          style={{ height: `calc(100vh - ${116 + (tags.length * 21)}px)` }}
          className='selection'
          onClick={this.handleMediaClick}
        >
          {selection.map(this.renderMedia)}
        </div>

        <style jsx>{`
          article {
            position: fixed;
            background: #888;
            top: 0;
            right: 0;
            display: block;
            width: 180px;
            padding: 12px;
          }

          article :global(.tag-filters) {
            position: relative;
          }

          article :global(.filter) {
            font-size: 12px;
            height: 21px;
            padding: 3px 0;
            line-height: 1.2;
            vertical-align: middle;
          }

          article :global(.filter input[type="checkbox"]) {
            vertical-align: middle;
          }

          article :global(.selection) {
            background: #777;
          }

          article :global(img) {
            border: none;
          }

          article :global(.media) {
            display: inline-block;
            width: calc(50% - 2px);
            margin-right: 0;
            margin-bottom: 0;
          }

          article :global(.media:nth-child(odd)) {
            margin-right: 3px;
          }

          article :global(.edit-button) {
            position: relative;
            top: -1px;
            font-size: 10px;
            padding: 1px 4px;
          }
        `}</style>
      </article>
    )
  }
}
