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
              <span>Никита Врацкий</span><span></span>
            </div>
          </>
        },
        {
          id: 2,
          speed: 0.2,
          children:<>
            <div className="panel">
              <span>Влад Мишота</span><span></span>
            </div>
          </>
        },
      ]}
    ></CollisionPane>
    </>
  )
}

export default App
