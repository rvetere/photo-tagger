import { Component } from 'react'
import ContainerDimensions from 'react-container-dimensions'

export default class Sidebar extends Component {

  renderChildren = (sidebarHeight, sidebarWidth) => (
    React.Children.map(this.props.children, (child, index) => (
      React.createElement(child.type, {
        ...child.props,
        key: `sidebar-child-${index}`,
        sidebarHeight,
        sidebarWidth
      }, child.props.children)
    ))
  )

  render () {
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
            background: #222;
            float: left;
            display: block;
            width: 20%;
            padding: 12px;
          }

          article :global(.media) {
            margin-right: 0;
          }
        `}</style>
      </article>

    )
  }
}
