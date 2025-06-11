import { Stage, Layer, Rect, Transformer, Image, Text } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image'

const Annotator = () => {
    const [rectangles, setRectangles] = useState([]);
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

    useEffect(() => {
        if (workingImage) {
            setImageSize({
                width: workingImage.width,
                height: workingImage.height,
            });
        }
    }, [workingImage]);

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


    const addAnnotation = (label) => {
        const newRect = {
            x: 0,
            y: 0,
            width: stageSize.width,
            height: stageSize.height,
            id: 'rect1',
            stroke: 'black',
            strokeWidth: (stageSize.width + stageSize.height) / 250,
            name: 'rect',
            label: label,
            rotation: 0,
        }

        setRectangles(
            [
                ...rectangles,
                newRect
            ]
        )
    }

    const handleTransformOrDrag = (id, node) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const updated = rectangles.map((rect) => {
            if (rect.id === id) {
                return {
                    ...rect,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, rect.width * scaleX),
                    height: Math.max(5, rect.height * scaleY),
                    rotation: node.rotation(),
                };
            }
            return rect;
        });

        node.scaleX(1);
        node.scaleY(1);

        setRectangles(updated);
    };

    function rotatePoint(px, py, cx, cy, angleDeg) {
        const angleRad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        const dx = px - cx;
        const dy = py - cy;

        const x = cx + dx * cos - dy * sin;
        const y = cy + dx * sin + dy * cos;

        return { x, y };
    }


    return (
        <div className='bg-white flex-4 flex justify-center items-center' ref={containerRef}>
            <div className='absolute' style={{ zIndex: 999, top: '95%' }}>
                <button onClick={() => addAnnotation("test")} className='p-2'>Add Annotation</button>
            </div>
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
                    {rectangles.map((rect) => {
                        const labelOffsetY = 100; 
                        const unrotatedLabelX = rect.x;
                        const unrotatedLabelY = rect.y - labelOffsetY;

                        const { x: labelX, y: labelY } = rotatePoint(
                            unrotatedLabelX,
                            unrotatedLabelY,
                            rect.x,
                            rect.y,
                            rect.rotation
                        );

                        return (
                            <>
                                <Rect
                                    key={rect.id}
                                    x={rect.x}
                                    y={rect.y}
                                    width={rect.width}
                                    height={rect.height}
                                    stroke={rect.stroke}
                                    strokeWidth={rect.strokeWidth}
                                    id={rect.id}
                                    name={rect.name}
                                    rotation={rect.rotation}
                                    draggable
                                    ref={node => {
                                        if (node) rectRefs.current.set(rect.id, node);
                                    }}
                                    onTransformEnd={(e) => handleTransformOrDrag(rect.id, e.target)}
                                    onDragEnd={(e) => handleTransformOrDrag(rect.id, e.target)}
                                />
                                <Text
                                    key={`${rect.id}-label`}
                                    x={labelX}
                                    y={labelY}
                                    text={rect.label}
                                    fontSize={80}
                                    fontFamily="Arial"
                                    fill="black"
                                    padding={2}
                                    rotation={rect.rotation}
                                    listening={false}
                                />
                            </>
                        );
                    })}

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