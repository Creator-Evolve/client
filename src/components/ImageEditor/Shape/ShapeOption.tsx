import React, { useState } from 'react'
import { MdOutlineRectangle } from 'react-icons/md'
import { FaRegCircle } from "react-icons/fa6";
import { PiArrowUpRightBold, PiLineVerticalBold } from "react-icons/pi";
import { IShape, IShapeStyle } from '../ImageEditor';
import { useHotkeys } from 'react-hotkeys-hook';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColorPicker, useColor } from 'react-color-palette';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export enum SHAPE_TYPES {
    RECTANGLE = 'rectangle',
    LINE = 'line',
    ARROW = 'arrow',
    ELLIPSE = 'ellipse'
}

const outlineWidth = [
    { label: "No Outline", value: 0 },
    { label: "Extra Small", value: 1 },
    { label: "Small", value: 2 },
    { label: "Medium Small", value: 4 },
    { label: "Medium", value: 6 },
    { label: "Medium Large", value: 9 },
    { label: "Large", value: 12 },
    { label: "Extra Large", value: 15 },
];


const shapesOption = [
    { id: 1, name: 'Rectangle', value: SHAPE_TYPES.RECTANGLE, icon: MdOutlineRectangle, disabled: [] },
    { id: 2, name: 'Line', value: SHAPE_TYPES.LINE, icon: PiLineVerticalBold, disabled: ["fill-color", "corner-radius"] },
    { id: 3, name: 'Arrow', value: SHAPE_TYPES.ARROW, icon: PiArrowUpRightBold, disabled: ["line-width", "corner-radius"] },
    { id: 4, name: 'Ellipse', value: SHAPE_TYPES.ELLIPSE, icon: FaRegCircle, disabled: ["corner-radius"] },
];

interface IProps {
    handleShapeStyle: (style: Partial<IShapeStyle>) => void
    handleDeleteElement: () => void
    selectedElement: IShape | null
}

const ShapeOption: React.FC<IProps> = ({ handleShapeStyle, handleDeleteElement, selectedElement }) => {
    const [fillColor, setFillColor] = useColor("#fffff")
    const [textColor, setTextColor] = useColor("#00000")
    const [selectedOpt, setSelectedOpt] = useState<typeof shapesOption[0]>(shapesOption[0])

    const [toolTip, setToolTip] = useState(0)

    useHotkeys("delete", () => handleDeleteElement())

    return (
        <div className=" mb-4">
            <div className="flex items-start justify-center mb-5 gap-5">
                {!selectedOpt?.disabled.includes("fill-color") && (
                    <div className="flex flex-col items-center justify-start">
                        <p className="text-xs font-medium">Fill Color</p>
                        <Popover>
                            <PopoverTrigger>
                                <div className="w-6 h-6 rounded-full border" style={{ background: fillColor.hex }} />
                            </PopoverTrigger>
                            <PopoverContent>
                                <ColorPicker color={fillColor} onChange={(color) => {
                                    setFillColor(color)
                                    handleShapeStyle({ fillColor: color.hex })
                                }} />
                            </PopoverContent>
                        </Popover>
                    </div>

                )}
                {!selectedOpt?.disabled.includes("line-color") && (
                    <div className="flex flex-col items-center justify-start">
                        <p className="text-xs font-medium">Line Color</p>
                        <Popover>
                            <PopoverTrigger>
                                <div className="w-6 h-6 rounded-full border" style={{ border: `4px solid ${textColor.hex}` }} />
                            </PopoverTrigger>
                            <PopoverContent>
                                <ColorPicker color={textColor} onChange={(color) => {
                                    setTextColor(color)
                                    handleShapeStyle({ stroke: color.hex })
                                }} />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {!selectedOpt?.disabled.includes("line-width") && (
                    <div className="flex flex-col items-center justify-start">
                        <p className="text-xs font-medium">Line width</p>
                        <Select onValueChange={(val) => handleShapeStyle({ strokeWidth: parseInt(val) })}>
                            <SelectTrigger className="w-[200px]  focus:ring-0 focus:border-none">
                                <SelectValue placeholder="No Outline" className='outline-none border-none' />
                            </SelectTrigger>
                            <SelectContent className='outline-none border-none'>
                                {
                                    outlineWidth.map(width => (
                                        <SelectItem value={width.value.toString()}>{width.label}</SelectItem>
                                    ))
                                }

                            </SelectContent>
                        </Select>
                    </div>
                )}

                {!selectedOpt?.disabled.includes("corner-radius") && (
                    <div className="flex flex-col items-center justify-start">
                        <p className="text-xs font-medium">Corner Radius</p>
                        <Popover>
                            <PopoverTrigger>
                                <h1>{toolTip}%</h1>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Slider max={100} defaultValue={[0]} showTooltip onValueChange={(val) => {
                                    setToolTip(val[0])
                                    handleShapeStyle({ cornerRadius: val[0] / 2 })
                                }} />
                            </PopoverContent>
                        </Popover>
                    </div>

                )}


            </div>
            <div className="flex gap-5">
                {
                    shapesOption.map(shape => (
                        <div
                            className={`flex gap-2 items-center border-2 rounded-lg p-2 w-32 cursor-pointer justify-center border-gray-600 transition-colors duration-300 ${shape.id === selectedOpt?.id ? "bg-black text-white" : "bg-white text-black"
                                }`}
                            onClick={() => {
                                handleShapeStyle({ shape: shape.value })
                                setSelectedOpt(shape)
                            }}
                        >
                            <shape.icon size={20} />
                            <p className="text-sm">{shape.name}</p>
                        </div>

                    ))
                }
            </div>
        </div >
    )
}

export default ShapeOption