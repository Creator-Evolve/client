import React, { Dispatch, RefObject, SetStateAction } from 'react';
import { Text, KonvaNodeEvents } from 'react-konva';

import Konva from 'konva';
import { IImage, IText } from '../ImageEditor';

interface IProps {
    stageRef: RefObject<Konva.Stage & KonvaNodeEvents>
    selectedElementId: string | null
    setSelectedElementId: Dispatch<SetStateAction<string | null>>
    element: IText
    elementRef: RefObject<any>
    setIsEditingText: Dispatch<SetStateAction<boolean>>
    setSelectedElement: Dispatch<SetStateAction<IText | null | undefined>>
    handleElementChange: (id: string, newAttrs: Partial<IText | IImage>) => void
    transformerRef: RefObject<Konva.Transformer & KonvaNodeEvents>
    handleElementDragMove: (e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => void
}

const TextElement: React.FC<IProps> = ({
    element,
    elementRef,
    selectedElementId,
    setSelectedElementId,
    stageRef,
    setIsEditingText,
    setSelectedElement,
    handleElementChange,
    transformerRef,
    handleElementDragMove
}) => {


    const getTextStyle = (bold: boolean, italic: boolean) => {
        if (bold && italic) return "italic bold"
        if (bold) return "bold"
        if (italic) return "italic"
        return "normal"
    }

    const removeExistingTextArea = () => {
        const textAreaElements = document.querySelectorAll('.textarea-input');
        textAreaElements.forEach((textArea) => {
            textArea.parentElement?.removeChild(textArea);
        });

        if (elementRef.current) {
            elementRef.current.show();
        }

        setIsEditingText(false);
    }


    const doubleClick = (e: Konva.KonvaEventObject<MouseEvent>, element: IText) => {
        removeExistingTextArea()
        e.target.hide();
        const textPosition = e.target.absolutePosition();
        const areaPosition = {
            x: (stageRef.current as Konva.Stage).container().offsetLeft + textPosition.x,
            y: (stageRef.current as Konva.Stage).container().offsetTop + textPosition.y,
        };

        const textarea = document.createElement("textarea");
        document.body.appendChild(textarea);

        // Set the initial textarea value and styles
        textarea.className = `textarea-input`
        textarea.value = element.content;
        textarea.style.position = 'absolute';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;

        const scale = elementRef.current.getAbsoluteScale().x;

        // Adjust the width and height based on the elementRef's width, height, and scale
        const adjustedWidth = elementRef.current.width() * scale;
        textarea.style.width = `${adjustedWidth}px`;
        textarea.style.minWidth = `${adjustedWidth}px`;
        textarea.style.height = 'auto';
        textarea.style.fontSize = `${elementRef.current.fontSize()}px`;
        textarea.style.border = '2px solid white';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.transform = `rotate(${element.rotation}deg)`; // Apply rotation
        textarea.style.transformOrigin = 'left top'; // Ensure rotation is applied correctly
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = `${elementRef.current.lineHeight()}`;
        textarea.style.fontFamily = elementRef.current.fontFamily();
        textarea.style.color = elementRef.current.fill();
        textarea.style.whiteSpace = 'nowrap'; // Prevent wrapping to the next line
        textarea.style.fontStyle = getTextStyle(element.bold, element.italic)

        textarea.focus();

        const removeTextarea = () => {
            textarea.parentNode?.removeChild(textarea);
            window.removeEventListener('click', handleOutsideClick);
            elementRef.current.show();
            transformerRef.current?.show();
            transformerRef.current?.forceUpdate();
            setIsEditingText(false);
            setSelectedElementId(null);
        };

        const handleOutsideClick = (e: MouseEvent) => {
            if (e.target !== textarea) {
                removeTextarea();
            }
        };

        textarea.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                handleElementChange(element.id, { content: textarea.value });
                removeTextarea();
            } else if (e.key === 'Escape') {
                removeTextarea();
            }
        });

        textarea.addEventListener('input', () => {
            const scale = elementRef.current.getAbsoluteScale().x;
            textarea.style.width = `${elementRef.current.width() * scale}px`;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight + elementRef.current.fontSize()}px`;
            handleElementChange(element.id, { content: textarea.value });
        });

        setIsEditingText(true);
    };


    return (
        <Text
            ref={element.id === selectedElementId ? elementRef : null}
            text={element.content}

            x={element.x}
            y={element.y}
            fontSize={(element as IText).fontSize}
            rotation={element.rotation}
            fill={(element as IText).fill}
            onDragMove={(e) => handleElementDragMove(e, element.id)} // Update position on drag move
            fontStyle={getTextStyle(element.bold, element.italic)}
            draggable
            fontFamily={element.font}
            onClick={(e) => {
                e.cancelBubble = true; // Prevent deselecting the text
                removeExistingTextArea()
                setSelectedElementId(element.id);
                setSelectedElement(element); // Capture position
            }}
            sceneFunc={(context, shape) => {
                if (element.bgColor) {
                    context.fillStyle = element.bgColor;
                    context.fillRect(0, 0, shape.width(), shape.height());
                    (shape as Konva.Text)._sceneFunc(context);
                }
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
            onDblClick={(e) => doubleClick(e, element)}
        />
    )
}

export default TextElement