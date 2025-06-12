import Annotator from "./components/Annotator"
import Attributes from "./components/Attributes"
import Explorer from "./components/Explorer"

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