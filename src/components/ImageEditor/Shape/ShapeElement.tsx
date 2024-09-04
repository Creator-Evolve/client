import React from 'react';
import { Rect, Line, Arrow, Ellipse } from 'react-konva';
import { IShape, SHAPE_TYPES } from '../ImageEditor';

interface IProps {
    element: IShape;
    elementRef: React.RefObject<any>;
    handleElementChange: (id: string, updates: Partial<IShape>) => void;
    handleElementDragMove: (e: any, id: string) => void;
    selectedElementId: string;
    setSelectedElementId: (id: string) => void;
    stageRef: React.RefObject<any>;
    transformerRef: React.RefObject<any>;
}

const ShapeElement: React.FC<IProps> = ({
    element,
    elementRef,
    handleElementChange,
    handleElementDragMove,
    selectedElementId,
    setSelectedElementId,
    stageRef,
}) => {
    const commonProps = {
        ref: element.id === selectedElementId ? elementRef : null,
        id: element.id,
        draggable: true,
        stroke: element.stroke,
        fill: element.fill,
        strokeEnabled: true,
        strokeWidth: element.strokeWidth,

        onDragEnd: (e: any) =>
            handleElementChange(element.id, { x: e.target.x(), y: e.target.y() }),
        onDragMove: (e: any) => handleElementDragMove(e, element.id),
        onClick: (e: any) => {
            e.cancelBubble = true;
            setSelectedElementId(element.id);
        },
        onMouseEnter: (e: any) => {
            if (stageRef.current) stageRef.current.container().style.cursor = 'move';
        },
        onMouseLeave: (e: any) => {
            if (stageRef.current) stageRef.current.container().style.cursor = 'crosshair';
        },
    };

    const handleTransformEnd = (e: any) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const newWidth = Math.max(5, node.width() * scaleX);
        const newHeight = Math.max(5, node.height() * scaleY);

        node.scaleX(1);
        node.scaleY(1);

        handleElementChange(element.id, {
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
        });
    };

    switch (element.shapeType) {
        case SHAPE_TYPES.RECTANGLE:
            return (
                <Rect
                    {...commonProps}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    onTransformEnd={handleTransformEnd}
                    cornerRadius={element.cornerRadius}
                />
            );
        case SHAPE_TYPES.LINE:
            return (
                <Line
                    {...commonProps}
                    points={element.points || []}
                />
            );
        case SHAPE_TYPES.ARROW:
            return (
                <Arrow
                    {...commonProps}
                    points={element.points || []}
                    fill={element.fill} // This sets the fill color for the arrowhead.
                    stroke={element.stroke} // This sets the stroke color for the arrow line.
                    strokeWidth={element.strokeWidth} // This sets the width of the arrow line.
                    pointerLength={10} // Adjust this value based on your requirements
                    pointerWidth={10} // Adjust this value based on your requirements
                />
            );
        case SHAPE_TYPES.ELLIPSE:
            return (
                <Ellipse
                    {...commonProps}
                    x={element.x}
                    y={element.y}
                    radiusX={element.width / 2}
                    radiusY={element.height / 2}
                    onTransformEnd={handleTransformEnd}
                />
            );
        default:
            return null;
    }
};

export default ShapeElement;
