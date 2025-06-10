import { Stage, Layer, Rect, Transformer, Image } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image'

const initialRectangles = [
  {
    x: 0,
    y: 0,
    width: 100,
    height: 90,
    id: 'rect1',
    stroke: 'black',
    strokeWidth: 2,
    name: 'rect',
    rotation: 0,
  },
  
];

const Annotator = () => {
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedIds, setSelectedIds] = useState<Array<String>>([]);

  const [workingImage] = useImage('https://konvajs.org/assets/yoda.jpg');

  const isSelecting = useRef(false);
  const transformerRef = useRef(null);
  const rectRefs = useRef(new Map());

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      // Get the nodes from the refs Map
      const nodes = selectedIds
        .map(id => rectRefs.current.get(id))
        .filter(node => node);

      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      // Clear selection
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  // Click handler for stage
  const handleStageClick = (e) => {
    // If click on empty area - remove all selections
    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    // Do nothing if clicked NOT on our rectangles
    if (!e.target.hasName('rect')) {
      setSelectedIds([]);
      return;
    }

    const clickedId = e.target.id();

    // Do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      // If no key pressed and the node is not selected
      // select just one
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      // If we pressed keys and node was selected
      // we need to remove it from selection
      setSelectedIds(selectedIds.filter(id => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      // Add the node into selection
      setSelectedIds([...selectedIds, clickedId]);
    }
  };

  const handleMouseDown = (e) => {
    // Do nothing if we mousedown on any shape
    if (e.target !== e.target.getStage()) {
      return;
    }
  };

  const handleMouseMove = () => {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
  };

  const handleMouseUp = () => {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
    isSelecting.current = false;
  };


  return (
    <div className='bg-white'>
      <Stage
        width={workingImage?.width}
        height={workingImage?.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          <Image
            x={0}
            y={0}
            image={workingImage}
            width={workingImage?.width}
            height={workingImage?.height}
          />
          {/* Render rectangles directly */}
          {rectangles.map(rect => (
            <Rect
              key={rect.id}
              id={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke={rect.stroke}
              strokeWidth={rect.strokeWidth}
              name={rect.name}
              rotation={rect.rotation}
              draggable
              ref={node => {
                if (node) {
                  rectRefs.current.set(rect.id, node);
                }
              }}
            />
          ))}

          {/* Single transformer for all selected shapes */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}

          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Annotator;