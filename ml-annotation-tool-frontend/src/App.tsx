import Annotator from "./features/annotator/Annotator"
import Attributes from "./features/attributes/Attributes"
import Explorer from "./features/explorer/Explorer"

const App = () => {
  return (
    <div className='flex flex-row w-screen h-screen'>
      <Explorer></Explorer>
      <Annotator></Annotator>
      <Attributes></Attributes>
    </div>
  )
}

export default App