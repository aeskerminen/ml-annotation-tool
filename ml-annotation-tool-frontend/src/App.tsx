import Annotator from './Annotator'

const App = () => {
  return (
    <div className='flex flex-row w-screen h-screen'>
      <div className='flex-1 text-center bg-gray-600'>
        explorer
      </div>
      <Annotator></Annotator>

      <div className='flex-1 text-center bg-gray-600'>
        attributes
      </div>
    </div>
  )
}

export default App