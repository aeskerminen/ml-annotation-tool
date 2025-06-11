import { Stage, Layer, Rect, Transformer, Image, Text } from 'react-konva';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

// Rectangle annotation type
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    stroke: string;
    strokeWidth: number;
    name: string;
    label: string;
    rotation: number;
}

const DEFAULT_IMAGE = '/images/annotation_test_image.jpeg';
const DEFAULT_STAGE_SIZE = { width: 1000, height: 1000, scale: 1 };
const MIN_RECT_SIZE = 5;
const LABEL_FONT_SIZE = 80;
const LABEL_OFFSET_Y = 100;

const Annotator = () => {
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [workingImage] = useImage(DEFAULT_IMAGE);
    const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
    const isSelecting = useRef(false);
    const transformerRef = useRef<any>(null);
    const rectRefs = useRef<Map<string, any>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const [showAnnotationModal, setShowAnnotationModal] = useState(false);
    const [stageSize, setStageSize] = useState(DEFAULT_STAGE_SIZE);
    const [selectedAttribute, setSelectedAttribute] = useState<string>('');
    const attributes = useSelector((state: RootState) => state.attributes.value);

    // Update image size when loaded
    useEffect(() => {
        if (workingImage) {
            setImageSize({
                width: workingImage.width,
                height: workingImage.height,
            });
        }
    }, [workingImage]);

    // Responsive stage size
    const updateSize = useCallback(() => {
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
    }, [imageSize]);

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [imageSize, updateSize]);

    // Update transformer nodes on selection change
    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            const nodes = selectedIds
                .map(id => rectRefs.current.get(id))
                .filter(Boolean);
            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedIds]);

    // Stage click handler
    const handleStageClick = useCallback((e: any) => {
        if (e.target === e.target.getStage() || !e.target.hasName('rect')) {
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
    }, [selectedIds]);

    // Mouse event handlers (placeholders for future selection logic)
    const handleMouseDown = useCallback((e: any) => {
        if (e.target !== e.target.getStage()) return;
    }, []);
    const handleMouseMove = useCallback(() => {
        if (!isSelecting.current) return;
    }, []);
    const handleMouseUp = useCallback(() => {
        if (!isSelecting.current) return;
        isSelecting.current = false;
    }, []);

    // Add new annotation
    const addAnnotation = useCallback((label?: string) => {
        if (!label) return;
        const newRect: Rectangle = {
            x: 0,
            y: 0,
            width: stageSize.width,
            height: stageSize.height,
            id: uuidv4(),
            stroke: 'black',
            strokeWidth: (stageSize.width + stageSize.height) / 250,
            name: 'rect',
            label,
            rotation: 0,
        };
        setRectangles(prev => [...prev, newRect]);
    }, [stageSize]);

    // Handle transform or drag
    const handleTransformOrDrag = useCallback((id: string, node: any) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        setRectangles(prev => prev.map(rect => {
            if (rect.id === id) {
                return {
                    ...rect,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(MIN_RECT_SIZE, rect.width * scaleX),
                    height: Math.max(MIN_RECT_SIZE, rect.height * scaleY),
                    rotation: node.rotation(),
                };
            }
            return rect;
        }));
        node.scaleX(1);
        node.scaleY(1);
    }, []);

    // Utility: rotate a point around a center
    const rotatePoint = (px: number, py: number, cx: number, cy: number, angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const dx = px - cx;
        const dy = py - cy;
        return {
            x: cx + dx * cos - dy * sin,
            y: cy + dx * sin + dy * cos,
        };
    };

    // Create Pascal VOC XML
    const createVOCXml = ({ filename, path, width, height, depth = 3, boxes = [] }: any) => {
        const xmlHeader = `<?xml version="1.0"?>\n<annotation>`;
        const xmlFooter = `</annotation>`;
        const xmlMainInfo = `\n    <folder>VOCImages</folder>\n    <filename>${filename}</filename>\n    <path>${path}</path>\n    <source>\n        <database>Unknown</database>\n    </source>\n    <size>\n        <width>${width}</width>\n        <height>${height}</height>\n        <depth>${depth}</depth>\n    </size>\n    <segmented>0</segmented>`;
        const xmlObjects = boxes.map(({ x, y, width, height, label }: Rectangle) => {
            const xmin = x;
            const ymin = y;
            const xmax = x + width;
            const ymax = y + height;
            return `\n    <object>\n        <name>${label}</name>\n        <pose>Unspecified</pose>\n        <truncated>0</truncated>\n        <difficult>0</difficult>\n        <bndbox>\n        <xmin>${xmin}</xmin>\n        <ymin>${ymin}</ymin>\n        <xmax>${xmax}</xmax>\n        <ymax>${ymax}</ymax>\n        </bndbox>\n    </object>`;
        }).join("\n");
        return `${xmlHeader}${xmlMainInfo}${xmlObjects}\n${xmlFooter}`;
    };

    // Export to VOC XML
    const exportToVOCXML = useCallback(() => {
        const raw_xml = createVOCXml({
            filename: 'test.jpg',
            path: 'test.jpg',
            width: 8256,
            height: 5504,
            boxes: rectangles
        });
        const blob = new Blob([raw_xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'annotation.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, [rectangles]);

    // Memoized rectangle elements
    const renderedRectangles = useMemo(() => rectangles.map((rect) => {
        const unrotatedLabelX = rect.x;
        const unrotatedLabelY = rect.y - LABEL_OFFSET_Y;
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
                    onTransformEnd={e => handleTransformOrDrag(rect.id, e.target)}
                    onDragEnd={e => handleTransformOrDrag(rect.id, e.target)}
                />
                <Text
                    key={`${rect.id}-label`}
                    x={labelX}
                    y={labelY}
                    text={rect.label}
                    fontSize={LABEL_FONT_SIZE}
                    fontFamily="Arial"
                    fill="black"
                    padding={2}
                    rotation={rect.rotation}
                    listening={false}
                />
            </>
        );
    }), [rectangles, handleTransformOrDrag]);

    return (
        <div className="bg-white flex-4 flex justify-center items-center" ref={containerRef}>
            <div className="absolute flex flex-row gap-2" style={{ zIndex: 999, top: '95%' }}>
                <button onClick={() => setShowAnnotationModal(true)} className="p-2">Add Annotation</button>
                <button onClick={exportToVOCXML}>Export to VOC XML</button>
            </div>
            {showAnnotationModal && (
                <div className="absolute p-2 bg-black flex flex-col justify-center" style={{ zIndex: 999 }}>
                    <select value={selectedAttribute} onChange={e => setSelectedAttribute(e.target.value)}>
                        <option value="" disabled>Select attribute</option>
                        {attributes.map((a: string) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                    <button onClick={() => { addAnnotation(selectedAttribute); setShowAnnotationModal(false); }}>Add</button>
                </div>
            )}
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
                    {renderedRectangles}
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < MIN_RECT_SIZE || newBox.height < MIN_RECT_SIZE) {
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