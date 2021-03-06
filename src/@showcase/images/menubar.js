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
    this.handleChange = this.handleChange.bind(this)
    this.editTagName = this.editTagName.bind(this)
    this.spreadTag = this.spreadTag.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.handleMediaClick = this.handleMediaClick.bind(this)

    this.state = {
      tagEditing: {}
    }
  }

  finishSelection () {
    const selectionValue = this.inputRef.current.value
    this.props.onSelectionFinish(selectionValue)
  }

  groupSelection () {
    this.props.onSelectionGroup()
  }

  handleMediaClick (event) {
    event.preventDefault()
    const media = event.target.attributes.media.nodeValue
    const filtered = this.props.selection.filter((entry) => entry !== media)
    this.props.updateImagesState({ selection: filtered })
  }

  async handleChange (event) {
    const filter = event.target.name
    if (filter === 'animated-only') {
      this.props.setAnimatedOnly(event.target.checked)
      await this.props.updateImagesState({ withAnimatedOnly: event.target.checked })
      return
    }
    if (filter === 'static-only') {
      this.props.setStaticOnly(event.target.checked)
      await this.props.updateImagesState({ withStaticOnly: event.target.checked })
      return
    }
    if (filter === 'untagged-only') {
      this.props.setUntaggedOnly(event.target.checked)
      await this.props.updateImagesState({ withUntaggedOnly: event.target.checked })
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

    let { tagSpreading } = this.props
    tagSpreading = tag
    this.props.updateImagesState({ tagSpreading })
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

  render () {
    const { meta, selection, folderPath, isEditingGroup, withAnimatedOnly, withStaticOnly, tagSpreading } = this.props
    const { tagEditing } = this.state
    const isSelecting = selection.length > 0

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
        {tags.length > 0 && <hr />}

        <div className='tag-filters'>
          {Array.from(['animated-only', 'static-only', 'untagged-only']).concat(tags).map((tag, index) => {
            const isTagEditing = tagEditing[index] && index > 2
            return (
              <div key={index} className='filter'>
                {!isTagEditing &&
                <Fragment>
                  <label>
                    <input name={tag} disabled={index < 2 ? (index === 0 ? withStaticOnly : withAnimatedOnly) : false} onChange={this.handleChange} type='checkbox' />
                    {tag}
                  </label>
                  {index > 2 &&
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
            <FormattedMessage id='@showcase.images.menuBar.delete' defaultMessage='Delete' />
          </button>
          {' '}
          <button onClick={this.props.moveSelection}>
            <FormattedMessage id='@showcase.images.menuBar.move' defaultMessage='Move' />
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
          <button onClick={() => this.props.updateImagesState({ tagSpreading: null })}>
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
