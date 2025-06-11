import Annotator from './Annotator'
import Attributes from './Attributes'

const App = () => {
  return (
    <div className='flex flex-row w-screen h-screen'>
      <div className='flex-1 text-center bg-gray-600'>
        explorer
      </div>
      <Annotator></Annotator>
      <Attributes></Attributes>
    </div>
  )
}

export default App