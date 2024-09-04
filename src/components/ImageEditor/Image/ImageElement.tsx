
import { Image } from 'react-konva'

import React, { Dispatch, RefObject, SetStateAction } from 'react';
import { Text, KonvaNodeEvents } from 'react-konva';

import Konva from 'konva';
import { IImage, IText } from '../ImageEditor';


interface IProps {
    stageRef: RefObject<Konva.Stage & KonvaNodeEvents>
    selectedElementId: string | null
    setSelectedElementId: Dispatch<SetStateAction<string | null>>
    element: IImage
    elementRef: RefObject<any>
    handleElementChange: (id: string, newAttrs: Partial<IText | IImage>) => void
    transformerRef: RefObject<Konva.Transformer & KonvaNodeEvents>
    handleElementDragMove: (e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => void
}

const ImageElement: React.FC<IProps> = ({ element, elementRef, handleElementChange, handleElementDragMove,
    selectedElementId,
    setSelectedElementId,
    stageRef,
}) => {
    return (
        <Image
            ref={element.id === selectedElementId ? elementRef : null}
            image={element.image!}
            x={element.x}
            y={element.y}
            draggable
            onClick={(e) => {
                e.cancelBubble = true;
                setSelectedElementId(element.id);
            }}
            onDragEnd={(e) => handleElementChange(element.id, { x: e.target.x(), y: e.target.y() })}
            onMouseEnter={(e) => {
                if (stageRef.current)
                    stageRef.current.container().style.cursor = 'move';

            }}
            onMouseLeave={(e) => {
                if (stageRef.current)
                    stageRef.current.container().style.cursor = 'crosshair';
            }}

        />
    )
}

export default ImageElement