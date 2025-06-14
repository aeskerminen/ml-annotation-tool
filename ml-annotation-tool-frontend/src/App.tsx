import AnnotationEditor from "./features/annotationEditor/AnnotationEditor"
import Annotator from "./features/annotator/Annotator"
import Attributes from "./features/attributes/Attributes"
import Explorer from "./features/explorer/Explorer"
import { ResizablePanel } from "./components/ResizablePanel"
import "./styles/resizable.css"

const App = () => {
  return (
    <div className='flex flex-row w-screen h-screen overflow-hidden'>
      <ResizablePanel direction="horizontal" defaultSize={400} minSize={200} maxSize={600}>
        <Explorer />
      </ResizablePanel>
      <Annotator />
      <ResizablePanel direction="horizontal" defaultSize={400} minSize={300} maxSize={600}>
        <ResizablePanel direction="vertical" defaultSize={300} minSize={200} maxSize={600}>
          <Attributes />
        </ResizablePanel>
        <AnnotationEditor />
      </ResizablePanel>
    </div>
  )
}

export default App