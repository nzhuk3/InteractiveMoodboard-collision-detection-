import CollisionPane from "./CollisionPane"


function App() {
  
  return (
    <>
    <CollisionPane
      movables={[
        {
          id: 1,
          speed: 0.5,
          children:<>
            <div className="panel">
              <span>Block</span><span> 1</span>
            </div>
          </>
        },
        {
          id: 2,
          speed: 0.2,
          children:<>
            <div className="panel">
              <span>Block</span><span> 2</span>
            </div>
          </>
        },
      ]}
    ></CollisionPane>
    </>
  )
}

export default App
