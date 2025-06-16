import { useState, useEffect, useRef, useCallback } from 'react';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { ImageStage } from './components/ImageStage';
import { AnnotationModal } from './components/AnnotationModal';
import { Toolbar } from './components/Toolbar';
import { DEFAULT_IMAGE, DEFAULT_STAGE_SIZE, MIN_ZOOM, MAX_ZOOM, MIN_RECT_SIZE } from './utils/annotator_constants';
import type { Rectangle } from './types/Rectangle';
import { clamp } from './utils/helper_functions';
import { add, update, } from '../../slices/rectangleSlice';

const Annotator = () => {
    const rectangles = useSelector((state: RootState) => state.rectangles.value);
    const dispatch = useDispatch();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [customImageUrl, setCustomImageUrl] = useState<string>(DEFAULT_IMAGE);
    const [originalFilename, setOriginalFilename] = useState<string>('annotation_test_image.jpeg');
    const [workingImage] = useImage(customImageUrl);
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
            height: containerHeight,
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
        const existingCount = rectangles.filter(r => r.label === label).length;
        // Calculate initial rectangle size as a percentage of the image dimensions
        const initialWidth = imageSize.width * 0.2; // 20% of image width
        const initialHeight = imageSize.height * 0.2; // 20% of image height
        
        // Center the rectangle in the image
        const x = (imageSize.width - initialWidth) / 2;
        const y = (imageSize.height - initialHeight) / 2;

        const newRect: Rectangle = {
            x,
            y,
            width: initialWidth,
            height: initialHeight,
            id: uuidv4(),
            stroke: 'black',
            strokeWidth: Math.min(imageSize.width, imageSize.height) * 0.002,
            name: existingCount ? `${label} ${existingCount + 1}` : '',
            label,
            rotation: 0,
        };
        dispatch(add(newRect));
    }, [stageSize, imageSize, dispatch]);

    // Handle transform or drag
    const handleTransformOrDrag = useCallback((id: string, node: any) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        dispatch(update({
            id,
            changes: {
                x: node.x(),
                y: node.y(),
                width: Math.max(MIN_RECT_SIZE, node.width() * scaleX),
                height: Math.max(MIN_RECT_SIZE, node.height() * scaleY),
                rotation: node.rotation(),
            }
        }));
        node.scaleX(1);
        node.scaleY(1);
    }, [dispatch]);

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
        // Use the original filename that we stored when the file was uploaded
        const filename = originalFilename;

        const raw_xml = createVOCXml({
            filename,
            path: filename,
            width: imageSize.width,
            height: imageSize.height,
            boxes: rectangles
        });
        const blob = new Blob([raw_xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\.[^/.]+$/, '') + '_VOC.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, [rectangles, originalFilename]);


    const uploadNewImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        if (customImageUrl && customImageUrl !== DEFAULT_IMAGE) {
            URL.revokeObjectURL(customImageUrl);
        }

        setOriginalFilename(file.name);
        setCustomImageUrl(objectUrl);
    }, [customImageUrl]);

    useEffect(() => {
        return () => {
            if (customImageUrl && customImageUrl !== DEFAULT_IMAGE) {
                URL.revokeObjectURL(customImageUrl);
            }
        };
    }, [customImageUrl]);

    return (
        <div className="bg-blue-100 flex-4 flex justify-center items-center relative h-screen overflow-hidden" ref={containerRef}>
            <Toolbar
                onAdd={() => setShowAnnotationModal(true)}
                onExport={exportToVOCXML}
                onUpload={uploadNewImage}
            />
            <AnnotationModal
                show={showAnnotationModal}
                attributes={attributes}
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
                onAdd={() => { addAnnotation(selectedAttribute); setShowAnnotationModal(false); }}
                onClose={() => setShowAnnotationModal(false)}
            />
            <ImageStage
                stageSize={stageSize}
                stagePosition={stagePosition}
                zoom={zoom}
                workingImage={workingImage}
                rectangles={rectangles}
                onWheel={handleWheel}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onClick={handleStageClick}
                transformerRef={transformerRef}
                stageRef={stageRef}
                handleTransformOrDrag={handleTransformOrDrag}
                rectRefs={rectRefs}
            />
        </div>
    );
};

export default Annotator;