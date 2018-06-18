import { FormattedMessage } from 'react-intl'

const Stats = ({ numOfFilesLoaded, resetSession }) => (
  <div>
    <span><FormattedMessage id='@showcase.images.stats.numOfFiles' defaultMessage='Number of files' />: {numOfFilesLoaded}</span>
    {' '}
    <button onDoubleClick={resetSession}>
      <FormattedMessage id='@showcase.images.menuBar.resetSession' defaultMessage='Reset Session' />
    </button>

    <style jsx>{`
      button {
        margin-left: 12px;
        font-size: 11px;
        padding: 1px 2px;
      }

      div {
        position: absolute;
        top: -8px;
        left: -8px;
        padding: 5px 12px 3px;
        width: 100%;
        height: 26px;
        font-size: 11px;
        color: rgba(255, 255, 255, .5);
        background: rgba(0, 0, 0, .4);
      }
    `}</style>
  </div>
)

export default Stats
