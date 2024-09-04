import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Transformer, KonvaNodeEvents, Ellipse, Arrow, Line, Rect } from 'react-konva';
import useImage from 'use-image';
import { nanoid } from 'nanoid';
import { RiShapesFill, RiText } from 'react-icons/ri';
import { FaFileExport, FaImage } from 'react-icons/fa';
import Konva from 'konva';
import TextEdit from './Text/TextEdit';
import TextElement from './Text/TextElement';
import TextOptions from './Text/TextOptions';
import ImageElement from './Image/ImageElement';
import ImageOptions from './Image/ImageOptions';
import { useHotkeys } from 'react-hotkeys-hook';
import ShapeElement from './Shape/ShapeElement';
import ShapeOption from './Shape/ShapeOption';
import { Button } from '../ui/button';

interface RenderTopBarProps {
    enable: boolean;
    element: (getDataUri: () => string) => JSX.Element;
}

interface IProp {
    url: string;
    renderTopBar?: RenderTopBarProps
}

export interface IText {
    id: string;
    type: 'text';
    content: string;
    x: number;
    y: number;
    fontSize: number;
    fill: string;
    zIndex: number;
    rotation: number
    bold: boolean
    italic: boolean
    font?: string
    bgColor?: string
}

export interface IImage {
    id: string;
    type: 'image';
    src: string;
    x: number;
    y: number;
    zIndex: number;
    image: HTMLImageElement | null;
    rotation: number
}

export enum SHAPE_TYPES {
    RECTANGLE = 'rectangle',
    LINE = 'line',
    ARROW = 'arrow',
    ELLIPSE = 'ellipse'
}

export interface IShape {
    id: string;
    type: 'shape';
    shapeType: SHAPE_TYPES;
    x: number;
    y: number;
    width: number;
    height: number;
    points?: number[]; // For line or arrow
    fill: string;
    rotation: number;
    stroke: string;
    strokeWidth?: number; // Optional property for line width
    cornerRadius?: number; // Optional property for rectangle border radius
}

const editOptions = [
    {
        id: 0,
        name: "Text",
        icon: RiText
    },
    {
        id: 1,
        name: "Image",
        icon: FaImage
    },
    {
        id: 2,
        name: "Elements",
        icon: RiShapesFill
    },
    {
        id: 3,
        name: "Export",
        icon: FaFileExport
    },
]

export interface ITextStyle {
    font: string
    color: string
    background: string,
    fontSize: string
}

export interface IShapeStyle {
    shape: SHAPE_TYPES
    lineColor?: string
    fillColor?: string
    lineWidth?: string
    rectBorderRadius?: number
    stroke?: string;
    strokeWidth?: number; // Optional property for line width
    cornerRadius?: number; // Optional property for rectangle border radius
}

const ImageEditor: React.FC<IProp> = ({ url, renderTopBar }) => {
    const [backgroundImage] = useImage(url, "anonymous");
    const [elements, setElements] = useState<(IText | IImage | IShape)[]>([]);

    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    const transformerRef = useRef<Konva.Transformer & KonvaNodeEvents>(null);
    const elementRef = useRef<any>(null);
    const stageRef = useRef<Konva.Stage & KonvaNodeEvents>(null);
    const [isEditingText, setIsEditingText] = useState(false);

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [selectedTextElement, setSelectedTextElement] = useState<IText | null>();

    const [editOption, setEditOption] = useState<number | null>(null)

    const [textStyle, setTextStyle] = useState<ITextStyle>({ background: "#ffffff00", color: "#000000", font: "Arial", fontSize: "24px" })

    const [shapeStyle, setShapeStyle] = useState<IShapeStyle>({ shape: SHAPE_TYPES.RECTANGLE })

    const addShape = (shapeType: IShape['shapeType'], x: number, y: number) => {
        const newShape: IShape = {
            id: nanoid(),
            type: 'shape',
            shapeType,
            x,
            y,
            width: shapeType === 'line' || shapeType === 'arrow' ? 100 : 50, // Default sizes
            height: shapeType === 'line' || shapeType === 'arrow' ? 0 : 50,
            stroke: 'black',
            fill: 'transparent',
            rotation: 0,
            points: shapeType === 'line' || shapeType === 'arrow' ? [x, y, x + 100, y] : undefined, // Line/Arrow points
        };

        setElements([...elements, newShape]);
        setSelectedElementId(newShape.id);
    };


    useEffect(() => {
        if (backgroundImage) {
            const maxWidth = window.innerWidth * 0.7; // 50vw
            const maxHeight = window.innerHeight; // Adjust height as needed

            let scale = 1;
            if (backgroundImage.width > maxWidth || backgroundImage.height > maxHeight) {
                scale = Math.min(maxWidth / backgroundImage.width, maxHeight / backgroundImage.height);
            }

            setImageDimensions({
                width: backgroundImage.width * scale,
                height: backgroundImage.height * scale,
            });
        }
    }, [backgroundImage]);

    useEffect(() => {
        if (selectedElementId && transformerRef.current && elementRef.current) {
            transformerRef.current.nodes([elementRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedElementId]);


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

    const addText = (x: number, y: number) => {
        removeExistingTextArea()
        // Add the new text element
        const newText: IText = {
            id: nanoid(),
            type: 'text',
            content: 'Text',
            x,
            y,
            fontSize: parseInt(textStyle.fontSize) || 24,
            fill: textStyle.color || "#000000",
            bold: false,
            italic: false,
            zIndex: elements.length,
            rotation: 0,
            font: textStyle.font || "Arial",
            bgColor: textStyle.background || "#ffffff00"
        };

        setElements([...elements, newText]);
        setSelectedElementId(newText.id);
        setSelectedTextElement(newText)
    };

    const addImage = (newImageUrl: string) => {
        if (newImageUrl) {
            const image = new window.Image();
            image.src = newImageUrl;
            image.onload = () => {
                const originalWidth = image.width;
                const originalHeight = image.height;

                // Calculate 1/6th of the original image dimensions
                const resizedImageWidth = originalWidth / 6;
                const resizedImageHeight = originalHeight / 6;

                const newImage: IImage = {
                    id: nanoid(),
                    type: 'image',
                    src: newImageUrl,
                    x: 50,
                    y: 50,
                    zIndex: elements.length,
                    image,
                    rotation: 0
                };

                // Set the scaled dimensions
                if (newImage.image) {
                    newImage.image.width = resizedImageWidth;
                    newImage.image.height = resizedImageHeight;
                }

                setElements([...elements, newImage]);
            };
        }
    };



    function isElementType(element: any): element is IText | IImage | IShape {
        return (
            (element.type === 'text' && 'content' in element) ||
            (element.type === 'image' && 'src' in element) ||
            (element.type === 'shape' && 'shapeType' in element)
        );
    }


    const handleElementChange = (id: string, newAttrs: Partial<IText | IImage | IShape>) => {
        const updatedElements = elements.map((element) => (element.id === id ? { ...element, ...newAttrs } : element));
        const filteredElements = updatedElements.filter(isElementType);
        setElements(filteredElements);
    };

    const handleElementDragMove = (e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => {
        const x = e.target.x();
        const y = e.target.y();

        setElements((prevElements) =>
            prevElements.map((el) =>
                el.id === elementId ? { ...el, x, y } : el
            )
        );

        // Update selected element position for the floating div
        setSelectedTextElement(prev => ({ ...prev as IText, x, y }));
    };

    const handleTextStyle = ({ font, color, background, fontSize }: Partial<ITextStyle>) => {
        const updates: Partial<ITextStyle> = {};
        const elementUpdates: Partial<IText> = {};

        if (font) {
            updates.font = font;
            elementUpdates.font = font;
        }
        if (color) {
            updates.color = color;
            elementUpdates.fill = color;
        }
        if (background) {
            updates.background = background;
            elementUpdates.bgColor = background;
        }
        if (fontSize) {
            updates.fontSize = fontSize;
            elementUpdates.fontSize = parseInt(fontSize);
        }

        if (Object.keys(updates).length > 0) {
            setTextStyle(prev => ({ ...prev, ...updates }));
        }

        if (selectedTextElement?.id && Object.keys(elementUpdates).length > 0) {
            handleElementChange(selectedTextElement.id, elementUpdates);
            setSelectedTextElement(prev => ({ ...prev as IText, ...elementUpdates }));
        }
    };

    const handleShapeStyle = ({
        shape,
        lineColor,
        fillColor,
        lineWidth,
        rectBorderRadius,
        cornerRadius,
        stroke,
        strokeWidth,
    }: Partial<IShapeStyle>) => {
        const updates: Partial<IShapeStyle> = {};
        const elementUpdates: Partial<IShape> = {};

        if (shape) {
            updates.shape = shape;
            elementUpdates.shapeType = shape;
        }
        if (lineColor) {
            updates.lineColor = lineColor;
            elementUpdates.stroke = lineColor;
        }
        if (fillColor) {
            updates.fillColor = fillColor;
            elementUpdates.fill = fillColor;
        }
        if (lineWidth) {
            updates.lineWidth = lineWidth;
            elementUpdates.strokeWidth = parseInt(lineWidth, 10); // Ensures lineWidth is properly converted to a number
        }
        if (rectBorderRadius) {
            updates.rectBorderRadius = rectBorderRadius;
            elementUpdates.cornerRadius = rectBorderRadius; // No need to parse as it's already a number
        }
        if (stroke) {
            updates.stroke = stroke
            elementUpdates.stroke = stroke
        }

        if (strokeWidth) {
            updates.strokeWidth = strokeWidth
            elementUpdates.strokeWidth = strokeWidth
        }
        if (cornerRadius) {
            updates.cornerRadius = cornerRadius
            elementUpdates.cornerRadius = cornerRadius
        }

        if (Object.keys(updates).length > 0) {
            setShapeStyle(prev => ({ ...prev, ...updates }));
        }

        if (selectedElementId && Object.keys(elementUpdates).length > 0) {
            handleElementChange(selectedElementId, elementUpdates);
        }
    };


    const handleDeleteElement = () => {
        setElements(elements.filter(element => element.id !== selectedElementId));
        setSelectedElementId(null);
        setSelectedTextElement(null)
    };

    useHotkeys("enter", () => {
        if (editOption === 1 && transformerRef.current) setSelectedElementId(null)
    })

    const handleExportImage = (format: 'png' | 'jpeg') => {
        if (stageRef.current) {
            let mimeType;
            let fileExtension;

            switch (format) {
                case 'jpeg':
                    mimeType = "image/jpeg";
                    fileExtension = 'jpg';
                    break;
                case "png":
                default:
                    mimeType = "image/png";
                    fileExtension = 'png';
                    break;
            }

            // Get data URL for the selected format
            transformerRef.current?.hide()
            const dataURL = stageRef.current.toDataURL({ mimeType });
            transformerRef.current?.visible()

            // Create a link element to download the image
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `canvas-image.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };



    const renderOptionBasedOnSelectedOpt = (editOption: number) => {
        switch (editOption) {
            case 0:
                return <TextOptions handleTextStyle={handleTextStyle} />
            case 1:
                return <ImageOptions handleAddImage={addImage} handleDeleteElement={handleDeleteElement} />
            case 2:
                return <ShapeOption handleShapeStyle={handleShapeStyle} handleDeleteElement={handleDeleteElement} selectedElement={
                    (elements.find(elem => elem.type === "shape" && elem.id === selectedElementId) as IShape) || null
                } />
            case 3:
                return <div className='flex gap-5'>
                    <Button onClick={() => handleExportImage("png")}>Export as PNG</Button>
                    <Button onClick={() => handleExportImage("jpeg")}>Export as JPEG</Button>
                </div>
            default:
                return null
        }
    }

    return (
        <div className="flex items-start">
            <div className="p-2 mr-2">
                {
                    editOptions.map(opt => (
                        <div className={`flex flex-col justify-center items-center border border-gray-200 px-4 py-2 cursor-pointer rounded hover:bg-gray-100 mb-4 ${opt.id === editOption ? "bg-gray-200" : ""}`} key={opt.id} onClick={() => setEditOption(opt.id)}>
                            <opt.icon size={20} className='text-primary' />
                            <p className='text-sm mt-1'>{opt.name}</p>
                        </div>
                    ))
                }
            </div>
            <div className="flex flex-col items-center gap-4">
                {
                    renderTopBar?.enable &&
                    renderTopBar.element(() => {
                        if (stageRef.current) {
                            transformerRef.current?.hide()
                            const uri = stageRef.current.toDataURL();
                            transformerRef.current?.visible()
                            return uri
                        }

                        return ""
                    })
                }
                <Stage
                    ref={stageRef}
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                    className={`border shadow-lg ${editOption === 0 || editOption === 2 ? "cursor-crosshair" : ""} relative`}
                    onClick={(e) => {
                        const stage = e.target.getStage();

                        if (stage) {
                            const pointerPosition = stage.getPointerPosition();
                            if (pointerPosition) {
                                if (editOption === 0)
                                    addText(pointerPosition.x, pointerPosition.y);

                                else if (editOption === 2)
                                    addShape(shapeStyle.shape, pointerPosition.x, pointerPosition.y)
                            }
                        }
                    }}
                >
                    <Layer>
                        <Image image={backgroundImage} width={imageDimensions.width} height={imageDimensions.height} />
                        {elements.map((element) => (
                            <React.Fragment key={element.id}>
                                {element.type === 'text' ? (
                                    <TextElement
                                        elementRef={elementRef}
                                        stageRef={stageRef}
                                        selectedElementId={selectedElementId}
                                        setSelectedElementId={setSelectedElementId}
                                        setSelectedElement={setSelectedTextElement}
                                        setIsEditingText={setIsEditingText}
                                        transformerRef={transformerRef}
                                        handleElementChange={handleElementChange}
                                        handleElementDragMove={handleElementDragMove}
                                        element={element}
                                    />
                                ) : element.type === "image" ? (
                                    <ImageElement
                                        element={element}
                                        elementRef={elementRef}
                                        selectedElementId={selectedElementId}
                                        setSelectedElementId={setSelectedElementId}
                                        transformerRef={transformerRef}
                                        handleElementChange={handleElementChange}
                                        handleElementDragMove={handleElementDragMove}
                                        stageRef={stageRef}
                                    />
                                ) : (
                                    <ShapeElement
                                        element={element}
                                        elementRef={elementRef}

                                        setSelectedElementId={setSelectedElementId}
                                        selectedElementId={selectedElementId as string}

                                        transformerRef={transformerRef}
                                        handleElementChange={handleElementChange}
                                        handleElementDragMove={handleElementDragMove}
                                        stageRef={stageRef}
                                    />
                                )}


                                {selectedElementId === element.id && (
                                    <React.Fragment>
                                        {
                                            !isEditingText &&
                                            <Transformer ref={transformerRef}
                                                enabledAnchors={element.type === "shape" ? [
                                                    'top-left',      // Top-left corner
                                                    'top-center',    // Middle of the top edge
                                                    'top-right',     // Top-right corner
                                                    'middle-left',   // Middle of the left edge
                                                    'middle-right',  // Middle of the right edge
                                                    'bottom-left',   // Bottom-left corner
                                                    'bottom-center', // Middle of the bottom edge
                                                    'bottom-right',  // Bottom-right corner
                                                ] : ['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                                                rotateEnabled={true} rotateAnchorCursor='move' />
                                        }
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        ))}
                    </Layer>

                </Stage>


                {(selectedElementId === selectedTextElement?.id && selectedTextElement?.type === "text" && !isEditingText) ? (
                    <TextEdit
                        stageRef={stageRef}
                        selectedElementId={selectedElementId}
                        selectedElement={selectedTextElement}
                        handleElementChange={handleElementChange}
                        setSelectedElement={setSelectedTextElement}
                        handleDeleteElement={handleDeleteElement}
                    />
                ) : null}

                {renderOptionBasedOnSelectedOpt(editOption as number)}
            </div>
        </div >
    );
};

export default ImageEditor;
