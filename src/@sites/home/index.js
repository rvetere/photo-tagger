import { Component } from 'react'
import ShowCase from '@showcase'

export default class Home extends Component {
  render () {
    const { globals, renderGlobals } = this.props
    return (
      <div>
        <ShowCase globals={globals} renderGlobals={renderGlobals} />
      </div>
    )
  }
}
