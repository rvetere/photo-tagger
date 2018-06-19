import React, { Component, Fragment } from 'react'
import MetaInfo from './metaInfo'

export default class Image extends Component {
  constructor(props) {
    super(props)

    this.imageRef = React.createRef()
    this.handleOnLoad = this.handleOnLoad.bind(this)
    const isFinal = this.props.isFinal.width ? this.props.isFinal : null
    this.state = isFinal || {
      width: null,
      height: null
    }
  }

  handleOnLoad () {
    if (this.props.isFinal) {
      return
    }

    const newState = {
      width: this.imageRef.current.width,
      height: this.imageRef.current.height
    }
    this.setState(newState, () => {
      this.props.onLoad && this.props.onLoad(this.props.media, newState)
    })
  }

  componentDidMount () {
    if (this.imageRef.current.complete) {
      // in this case the "onLoad" event will never occur!
      this.handleOnLoad()
    }

    if (this.props.intersectionObserver && this.props.isFinal) {
      const { intersectionObserver } = this.props
      // intersectionObserver.observe(this.imageRef.current)
    }
  }

  render () {
    const { src, alt, isFinal, isSelected, groupId = null, metaData = {}, ...props } = this.props
    const defaultStyles = isSelected ? { borderColor: '#0490CE' } : {}
    let styleObj = {}
    let styleObjDiv = {}
    if (isFinal && isFinal.width) {
      let newWidth = isFinal.width * 1
      let percentage = ((newWidth * 100) / isFinal.width) / 100
      let newHeight = isFinal.height * percentage
      styleObj = { width: newWidth }
      styleObjDiv = { width: newWidth, height: newHeight }
      if (isFinal.isPortrait) {
        if (props.sidebarWidth > 650) {
          styleObj = { height: newHeight }
          styleObjDiv = { height: newHeight, width: newWidth }
        }

        if (
          (newWidth) > props.sidebarWidth ||
          (newWidth) >= (props.sidebarWidth - 100)
        ) {
          newWidth = props.sidebarWidth - 24
          percentage = ((newWidth * 100) / isFinal.width) / 100
          styleObj = { width: newWidth }
          styleObjDiv = { width: newWidth, height: isFinal.height * percentage }
        }
      } else {
        if (
          (newWidth) > props.mainWidth ||
          (newWidth) >= (props.mainWidth - 100)
        ) {
          newWidth = props.mainWidth - 24
          percentage = ((newWidth * 100) / isFinal.width) / 100
          styleObj = { width: newWidth }
          styleObjDiv = { width: newWidth, height: isFinal.height * percentage }
        }
      }
    }

    // const injectedProps = isFinal && isFinal.width ? {
    //   ['data-src']: src,
    //   src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    // } : {
    //   src
    // }

    const injectedProps = {
      src
    }

    // style={styleObjDiv}
    return (
      <div className='media'>
        <img {...injectedProps} className={`${groupId ? 'in-group' : ''} ${metaData.tags ? 'has-tags' : ''}`} media={props.media} ref={this.imageRef} style={{...styleObj, ...defaultStyles}} alt={alt} onLoad={this.handleOnLoad} onClick={this.props.handleClick} />
        <MetaInfo media={props.media} metaData={metaData} groupId={groupId} {...props} />

        <style jsx>{`
          div {
            position: relative;
            display: inline-block;
            vertical-align: middle ;
            margin-right: 12px;
            margin-bottom: 12px;
            overflow: hidden;
          }

          span {
            display: inline-block;
            margin-right: 6px;
          }

          img {
            border: 4px solid transparent;
            max-width: 100%;
          }
        `}</style>
      </div>
    )
  }
}
