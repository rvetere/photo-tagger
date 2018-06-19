import { Component } from 'react'
import ContainerDimensions from 'react-container-dimensions'

export default class Main extends Component {
  renderChildren = (mainHeight, mainWidth) => (
    React.Children.map(this.props.children, (child, index) => (
      React.createElement(child.type, {
        ...child.props,
        key: `main-child-${index}`,
        mainHeight,
        mainWidth
      }, child.props.children)
    ))
  )

  render () {
    const { children } = this.props
    return (
      <article>
        <ContainerDimensions>
          {({ height, width }) => (
            <div>
              {this.renderChildren(height, width)}
            </div>
          )}
        </ContainerDimensions>

        <style jsx>{`
          article {
            float: left;
            display: block;
            width: calc(95% - 160px);
            padding: 12px;
            min-height: 2400px;
          }
        `}</style>
      </article>
    )
  }
}
