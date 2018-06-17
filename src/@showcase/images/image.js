import React, { Component, Fragment } from 'react'
import MetaInfo from './metaInfo'

export default class Image extends Component {
  constructor(props) {
    super(props)

    this.imageRef = React.createRef()
    this.handleOnLoad = this.handleOnLoad.bind(this)
    this.state = this.props.isFinal || {
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
  }

  render () {
    const { src, alt, isFinal, isSelected, groupId = null, metaData = {}, ...props } = this.props
    const defaultStyles = isSelected ? { borderColor: '#0490CE' } : {}
    let styleObj = {}
    if (isFinal) {
      styleObj = { width: isFinal.width * 1.3 }
      if (isFinal.isPortrait) {
        if (props.sidebarWidth > 650) {
          styleObj = { height: isFinal.height * 1.3 }
          if (
            (isFinal.width * 1.3) > props.sidebarWidth ||
            (isFinal.width * 1.3) >= (props.sidebarWidth - 100)
          ) {
            styleObj = { width: props.sidebarWidth }
          }
        }
      }
    }
    return (
      <div className='media'>
        <img className={`${groupId ? 'in-group' : ''} ${metaData.tags ? 'has-tags' : ''}`} media={props.media} ref={this.imageRef} style={{...styleObj, ...defaultStyles}} src={src} alt={alt} onLoad={this.handleOnLoad} />
        <MetaInfo media={props.media} metaData={metaData} groupId={groupId} {...props} />

        <style jsx>{`
          div {
            position: relative;
            display: inline-block;
            margin-right: 12px;
            margin-bottom: 12px;
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
