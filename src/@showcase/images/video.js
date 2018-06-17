import React, { Component, Fragment } from 'react'
import MetaInfo from './metaInfo'

export default class Video extends Component {
  constructor(props) {
    super(props)

    this.videoRef = React.createRef()
    this.handleOnLoad = this.handleOnLoad.bind(this)
    this.state = this.props.isFinal || {
      width: null,
      height: null
    }
  }

  handleOnLoad () {
    this.videoRef.current.play()

    if (this.props.isFinal) {
      return
    }

    const newState = {
      width: this.videoRef.current.parentElement.offsetWidth,
      height: this.videoRef.current.parentElement.offsetHeight
    }
    this.setState(newState, () => {
      this.props.onLoad && this.props.onLoad(this.props.media, newState)
    })
  }

  render () {
    const { src, alt, isFinal, isSelected, groupId = null, metaData = {}, noControls = false, ...props } = this.props
    const defaultStyles = isSelected ? { borderColor: '#0490CE' } : {}
    return (
      <div className='media'>
        <video
          ref={this.videoRef}
          style={defaultStyles}
          src={src}
          media={props.media}
          onLoadStart={() => {
            setTimeout(() => {
              this.handleOnLoad()
            }, 265)
          }}
          onEnded={() => {
            this.videoRef.current.play()
          }}
          controls={!noControls}
          muted
        />
        <MetaInfo media={props.media} metaData={metaData} groupId={groupId} {...props} />

        <style jsx>{`
          div {
            position: relative;
            display: inline-block;
            margin-bottom: 12px;
            margin-right: 12px;
          }
          video {
            border: 4px solid transparent;
            max-width: 100%;
          }
        `}</style>
      </div>
    )
  }
}
