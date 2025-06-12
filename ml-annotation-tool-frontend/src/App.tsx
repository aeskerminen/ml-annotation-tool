import Annotator from './Annotator'
import Attributes from './Attributes'
import Explorer from './Explorer'

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