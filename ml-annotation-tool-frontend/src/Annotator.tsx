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
        strokeWidth: 1,
        name: 'rect',
        rotation: 0,
    },

];

const Annotator = () => {
    const [rectangles, setRectangles] = useState(initialRectangles);
    const [selectedIds, setSelectedIds] = useState<Array<string>>([]);

    const [workingImage] = useImage("/images/annotation_test_image.jpeg");
    const [imageSize, setImageSize] = useState({ width: 100, height: 100 });

    const isSelecting = useRef(false);
    const transformerRef = useRef(null);
    const rectRefs = useRef(new Map());

    const containerRef = useRef(null);

    const [stageSize, setStageSize] = useState({
        width: 1000,
        height: 1000,
        scale: 1,
    });

    // Update image size when loaded
    useEffect(() => {
        if (workingImage) {
            setImageSize({
                width: workingImage.width,
                height: workingImage.height,
            });
        }
    }, [workingImage]);

    // Resize logic
    const updateSize = () => {
        if (!containerRef.current || !imageSize.width || !imageSize.height) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight || window.innerHeight;

        const scale = Math.min(
            containerWidth / imageSize.width,
            containerHeight / imageSize.height
        );

        setStageSize({
            width: imageSize.width * scale,
            height: imageSize.height * scale,
            scale,
        });
    };

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [imageSize]);

    // Update transformer when selection changes
    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            const nodes = selectedIds
                .map(id => rectRefs.current.get(id))
                .filter(node => node);
            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedIds]);

    const handleStageClick = (e) => {
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
            return;
        }

        if (!e.target.hasName('rect')) {
            setSelectedIds([]);
            return;
        }

        const clickedId = e.target.id();
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = selectedIds.includes(clickedId);

        if (!metaPressed && !isSelected) {
            setSelectedIds([clickedId]);
        } else if (metaPressed && isSelected) {
            setSelectedIds(selectedIds.filter(id => id !== clickedId));
        } else if (metaPressed && !isSelected) {
            setSelectedIds([...selectedIds, clickedId]);
        }
    };

    const handleMouseDown = (e) => {
        if (e.target !== e.target.getStage()) return;
    };

    const handleMouseMove = () => {
        if (!isSelecting.current) return;
    };

    const handleMouseUp = () => {
        if (!isSelecting.current) return;
        isSelecting.current = false;
    };


    return (
        <div className='bg-white flex-4 flex justify-center items-center' ref={containerRef}>
            <Stage
                width={stageSize.width}
                height={stageSize.height}
                scaleX={stageSize.scale}
                scaleY={stageSize.scale}
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