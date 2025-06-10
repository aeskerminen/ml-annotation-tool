import Annotator from './Annotator'

const App = () => {
  return (
    <div className='flex flex-row w-screen'>
      <div className='flex-1 text-center'>
        explorer
      </div>
      <Annotator></Annotator>

      <div className='flex-1 text-center'>
        attributes
      </div>
    </div>
  )
}

export default App