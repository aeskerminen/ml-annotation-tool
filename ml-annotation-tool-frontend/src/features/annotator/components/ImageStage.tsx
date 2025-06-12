import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useMemo } from 'react';
import { Rect, Text, Stage, Layer, Image, Transformer } from 'react-konva';
import { DEFAULT_IMAGE, DEFAULT_STAGE_SIZE, MIN_ZOOM, MAX_ZOOM, MIN_RECT_SIZE, LABEL_OFFSET_Y, LABEL_FONT_SIZE } from '../utils/annotator_constants';
import { type Rectangle } from '../types/Rectangle';
import { rotatePoint } from '../utils/helper_functions';

// Image Stage component
export const ImageStage = ({
    stageSize, stagePosition, zoom, workingImage, rectangles, onWheel, onDragStart, onDragMove, onClick, transformerRef, stageRef, handleTransformOrDrag, rectRefs,
}: {
    stageSize: { width: number; height: number; scale: number; };
    stagePosition: { x: number; y: number; };
    zoom: number;
    workingImage: HTMLImageElement | undefined;
    rectangles: Rectangle[];
    onWheel: (e: KonvaEventObject<WheelEvent>) => void;
    onDragStart: (e: KonvaEventObject<DragEvent>) => void;
    onDragMove: (e: KonvaEventObject<DragEvent>) => void;
    onClick: (e: KonvaEventObject<MouseEvent>) => void;
    transformerRef: React.RefObject<Konva.Transformer | null>;
    stageRef: React.RefObject<Konva.Stage | null>;
    handleTransformOrDrag: (id: string, node: any) => void;
    rectRefs: React.MutableRefObject<Map<string, any>>;
}) => {
    // Memoize rectangle elements
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
                    onDragEnd={e => handleTransformOrDrag(rect.id, e.target)} />
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
                    listening={false} />
            </>
        );
    }), [rectangles, handleTransformOrDrag, rectRefs]);

    return (
        <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onWheel={onWheel}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            draggable
            x={stagePosition.x}
            y={stagePosition.y}
            scaleX={zoom}
            scaleY={zoom}
            onClick={onClick}
        >
            <Layer>
                <Image
                    x={0}
                    y={0}
                    image={workingImage}
                    width={workingImage?.width}
                    height={workingImage?.height}
                    stroke={'black'}
                    strokeWidth={20} />
                {renderedRectangles}
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < MIN_RECT_SIZE || newBox.height < MIN_RECT_SIZE) {
                            return oldBox;
                        }
                        return newBox;
                    }} />
            </Layer>
        </Stage>
    );
};
