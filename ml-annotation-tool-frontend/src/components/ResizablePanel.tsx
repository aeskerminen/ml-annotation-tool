import { ReactNode, useState } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface ResizablePanelProps {
    children: ReactNode;
    direction: 'horizontal' | 'vertical';
    defaultSize: number;
    minSize?: number;
    maxSize?: number;
    className?: string;
}

export const ResizablePanel = ({
    children,
    direction,
    defaultSize,
    minSize = 100,
    maxSize = 800,
    className = ''
}: ResizablePanelProps) => {
    const [size, setSize] = useState(defaultSize);

    const onResize = (_: React.SyntheticEvent, data: ResizeCallbackData) => {
        setSize(data.size[direction === 'horizontal' ? 'width' : 'height']);
    };

    const isHorizontal = direction === 'horizontal';

    return (
        <ResizableBox
            width={isHorizontal ? size : undefined}
            height={isHorizontal ? '100%' : size}
            minConstraints={[isHorizontal ? minSize : undefined, isHorizontal ? undefined : minSize]}
            maxConstraints={[isHorizontal ? maxSize : undefined, isHorizontal ? undefined : maxSize]}
            onResize={onResize}
            resizeHandles={[isHorizontal ? 'e' : 's']}
            handle={<div className={`resize-handle-${direction}`} />}
            className={`resizable-panel ${className}`}
            axis={isHorizontal ? 'x' : 'y'}
        >
            {children}
        </ResizableBox>
    );
};
