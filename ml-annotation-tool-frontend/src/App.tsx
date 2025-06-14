import Annotationeditor from "./features/annotationEditor/AnnotationEditor"
import Annotator from "./features/annotator/Annotator"
import Attributes from "./features/attributes/Attributes"
import Explorer from "./features/explorer/Explorer"

const App = () => {
  return (
    <div className='flex flex-row w-screen h-screen'>
      <Explorer></Explorer>
      <Annotator></Annotator>
      <div className="flex flex-col flex-1">
        <Attributes></Attributes>
        <Annotationeditor></Annotationeditor>
      </div>
    </div>
  )
}

export default App