import { Component } from 'react'

export default class Main extends Component {
  render () {
    const { children } = this.props
    return (
      <div>
        {children}

        <style jsx>{`
          div {
            float: left;
            display: block;
            width: calc(80% - 160px);
            padding: 12px;
          }
        `}</style>
      </div>
    )
  }
}
