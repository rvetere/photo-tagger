import { FormattedMessage } from 'react-intl'

const Alert = ({ children, type = 'warning' }) => (
  <article>
    <div className={type}>
      {children}
    </div>

    <style jsx>{`
      article {
        margin-bottom: 12px;
      }

      article :global(.error) {
        padding: 6px 12px;
        color: white;
        background: rgba(255, 94, 86, .8)
      }

      article :global(.warning) {
        padding: 6px 12px;
        color: white;
        background: rgba(244, 216, 25, .7);
      }

      article :global(.info) {
        padding: 6px 12px;
        color: white;
        background: rgba(108, 148, 196, .8);
      }
    `}</style>
  </article>
)

export const DbConnectionRequired = ({ dbConnected }) => {
  if (dbConnected) return null

  return (
    <Alert type='error'>
      <FormattedMessage id='@app.offline' defaultMessage='You are offline!' />
    </Alert>
  )
}

export default Alert
