import { Stage, Layer, Rect, Transformer, Image, Text } from 'react-konva';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';

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
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

// Utility function to limit a number between min and max
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Toolbar component for annotation actions
const Toolbar = ({ onAdd, onExport }: { onAdd: () => void; onExport: () => void }) => (
    <div className="absolute flex flex-row gap-4 top-6 z-50 bg-white border-2 border-[#1976d2] shadow-lg p-2 rounded items-center">
        <button
            onClick={onAdd}
            className="bg-[#1976d2] text-white px-6 py-2 font-bold border border-[#1976d2] hover:bg-[#1565c0] transition rounded focus:outline-none"
        >
            Add Annotation
        </button>
        <button
            onClick={onExport}
            className="bg-white text-[#1976d2] px-6 py-2 font-bold border border-[#1976d2] hover:bg-[#1976d2] hover:text-white transition rounded focus:outline-none"
        >
            Export to VOC XML
        </button>
    </div>
);

// Modal for adding annotation
const AnnotationModal = ({
    show,
    attributes,
    selectedAttribute,
    setSelectedAttribute,
    onAdd,
    onClose,
}: {
    show: boolean;
    attributes: string[];
    selectedAttribute: string;
    setSelectedAttribute: (val: string) => void;
    onAdd: () => void;
    onClose: () => void;
}) => {
    if (!show) return null;
    return (
        <div className="absolute p-2 bg-black flex flex-col justify-center" style={{ zIndex: 999 }}>
            <select value={selectedAttribute} onChange={e => setSelectedAttribute(e.target.value)}>
                <option value="" disabled>Select attribute</option>
                {attributes.map((a: string) => (
                    <option key={a} value={a}>{a}</option>
                ))}
            </select>
            <button onClick={onAdd}>Add</button>
            <button onClick={onClose} className="mt-2">Cancel</button>
        </div>
    );
};

const Annotator = () => {
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [workingImage] = useImage(DEFAULT_IMAGE);
    const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
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

    // Handle zoom
    const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const oldScale = zoom;
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stagePosition.x) / oldScale,
            y: (pointer.y - stagePosition.y) / oldScale,
        };

        const newZoom = clamp(
            zoom * (e.evt.deltaY < 0 ? 1.1 : 1 / 1.1),
            MIN_ZOOM,
            MAX_ZOOM
        );

        setZoom(newZoom);
        
        setStagePosition({
            x: pointer.x - mousePointTo.x * newZoom,
            y: pointer.y - mousePointTo.y * newZoom,
        });
    }, [zoom, stagePosition]);

    // Handle stage drag
    const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
        if (e.target !== e.target.getStage()) return;
        setSelectedIds([]);
    }, []);

    const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
        if (e.target !== e.target.getStage()) return;
        setStagePosition({
            x: e.target.x(),
            y: e.target.y(),
        });
    }, []);

    // Stage click handler
    const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
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
        <div className="bg-white flex-4 flex justify-center items-center relative h-full overflow-hidden" ref={containerRef}>
            <Toolbar onAdd={() => setShowAnnotationModal(true)} onExport={exportToVOCXML} />
            <AnnotationModal
                show={showAnnotationModal}
                attributes={attributes}
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
                onAdd={() => { addAnnotation(selectedAttribute); setShowAnnotationModal(false); }}
                onClose={() => setShowAnnotationModal(false)}
            />
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onWheel={handleWheel}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                draggable
                x={stagePosition.x}
                y={stagePosition.y}
                scaleX={zoom}
                scaleY={zoom}
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