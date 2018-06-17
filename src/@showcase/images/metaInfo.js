import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

export default class MetaInfo extends Component {

  killTag (event, tag) {
    event.preventDefault()
    this.props.removeTagFromMedia(tag, this.props.media)
  }

  render () {
    const { groupId = null, metaData = {}, startEditingGroup, ...props } = this.props
    return (
      <Fragment>
        {
          metaData.tags &&
          <p>
            {metaData.tags.map((tag, index) => (
              <span key={index}>#{tag}{' '}<button onClick={(event) => { this.killTag(event, tag) }}>x</button></span>
            ))}
          </p>
        }
        {
          groupId &&
          <figure>
            <span>group: {groupId}</span>
            {' '}
            <button disabled={this.props.isEditingGroup} onClick={() => { this.props.startEditingGroup(groupId) }}>
              <FormattedMessage id='@showcase.images.metaInfo.editGroup' defaultMessage='E' />
            </button>
          </figure>
        }

        <style jsx>{`
          button {
            position: relative;
            top: -1px;
            font-size: 10px;
            padding: 1px 4px;
          }

          p {
            position: absolute;
            margin: 0;
            padding: 3px;
            color: black;
            top: -3px;
            left: 6px;
            font-size: 12px;
            background: rgba(200, 200, 200, .8)
          }

          span {
            margin-right: 6px;
          }

          figure {
            margin: 0;
            padding: 3px;
            position: absolute;
            color: black;
            left: 6px;
            top: 45px;
            font-size: 12px;
            background: rgba(122, 122, 200, .8)
          }
        `}</style>
      </Fragment>
    )
  }
}
