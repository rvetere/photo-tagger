import React, { Component, Fragment } from 'react'
import { compose } from 'recompose'
import WithGlobals from '@decorators/withGlobals'
import WithIntl from '@decorators/withIntl'
import LanguageSwitcher from './languageSwitcher'
class Layout extends Component {

  renderChildren = () => (
    React.Children.map(this.props.children, (child, index) => (
      React.createElement(child.type, {
        ...child.props,
        key: `layout-child-${index}`,
        globals: this.props.globals,
        renderGlobals: this.props.renderGlobals
      }, child.props.children)
    ))
  )

  render () {
    const { globals, updateGlobals } = this.props
    return (
      <Fragment>
        {
          globals.languages &&
          <LanguageSwitcher
            currentLang={globals.locale}
            languages={globals.languages}
            updateGlobals={updateGlobals}
          />
        }

        {this.renderChildren()}
      </Fragment>
    )
  }
}

export default compose(
  WithGlobals,
  WithIntl
)(Layout)