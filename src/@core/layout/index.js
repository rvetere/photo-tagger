import { Component } from 'react'
import DragArea from './dragArea'
import Content from './content'
export default class Layout extends Component {

  render () {
    return (
      <div className='layout'>
        <DragArea />
        <Content children={this.props.children} />

        <style jsx>{`
          :global(html),
          :global(body) {
            height: calc(100vh - 16px);
          }
          :global(body > div) {
            height: calc(100vh - 16px);
          }
          :global(body > div#__next-error) {
            position: absolute;
          }
          :global(body *) {
            box-sizing: border-box;
          }

          div {
            height: 100%;
            padding: 18px 12px;
            position: relative;
            color: #ddd;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          }
        `}</style>
      </div>
    )
  }
}
