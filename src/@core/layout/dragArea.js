const DragArea = () => (
  <div>
    <style jsx>{`
      div {
        position: absolute;
        top: -8px;
        left: 0;
        width: 100%;
        height: 26px;
        -webkit-app-region: drag;
      }
    `}</style>
  </div>
)

export default DragArea
