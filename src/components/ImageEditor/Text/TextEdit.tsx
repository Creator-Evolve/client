import Konva from 'konva'
import React, { Dispatch, Ref, RefObject, SetStateAction } from 'react'
import { KonvaNodeEvents } from 'react-konva'
import { IImage, IText } from '../ImageEditor'
import { Trash } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { useHotkeys } from 'react-hotkeys-hook'

interface IProps {
    stageRef: RefObject<Konva.Stage & KonvaNodeEvents>
    selectedElementId: string | null
    selectedElement: IText | null
    setSelectedElement: Dispatch<SetStateAction<IText | null | undefined>>
    handleElementChange: (id: string, newAttrs: Partial<IText | IImage>) => void
    handleDeleteElement: () => void
}

const TextEdit: React.FC<IProps> = ({
    selectedElementId,
    stageRef,
    selectedElement,
    handleElementChange,
    setSelectedElement,
    handleDeleteElement
}) => {

    const handleTextBoldToggle = () => {
        if (selectedElementId && selectedElement) {
            handleElementChange(selectedElementId, { bold: !selectedElement.bold });
            setSelectedElement(prev => ({ ...prev as IText, bold: !prev?.bold }))
        }
    };

    const handleTextItalicToggle = () => {
        if (selectedElementId && selectedElement) {
            handleElementChange(selectedElementId, { italic: !selectedElement.italic });
            setSelectedElement(prev => ({ ...prev as IText, italic: !prev?.italic }))
        }
    };





    useHotkeys("ctrl+b", () => {
        if (selectedElementId) {
            handleTextBoldToggle()
        }
    })

    useHotkeys("ctrl+i", () => {
        if (selectedElementId) {
            handleTextItalicToggle()
        }
    })

    useHotkeys("delete", () => {
        if (selectedElementId) {
            handleDeleteElement()
        }
    })

    if (!selectedElement || !stageRef.current || !selectedElementId)
        return null

    return (
        <div style={{
            position: 'absolute',
            top: selectedElement.y + 50 + (stageRef.current as Konva.Stage).container().offsetTop,
            left: selectedElement.x + (stageRef.current as Konva.Stage).container().offsetLeft,
            background: '#f1f1f1',
            padding: '10px',
            borderRadius: '5px',
            display: 'flex',
            gap: '10px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
        }}>
            <Button onClick={() => handleTextBoldToggle()} className={`bold hover:text-white ${selectedElement.bold ? "bg-black text-white" : "bg-white text-black"}`}>B</Button>
            <Button onClick={() => handleTextItalicToggle()} className={`italic hover:text-white ${selectedElement.italic ? "bg-black text-white" : "bg-white text-black"}`}>I</Button>
            <div onClick={() => document.getElementById('color-picker')?.click()} // Trigger the input click on parent div click
                className="inline-block cursor-pointer p-2 rounded bg-gray-100">
                <div className="w-5 h-5 rounded-full border border-gray-300" style={{
                    backgroundColor: selectedElement?.fill
                }} />
                <Input id="color-picker" type="color" value={selectedElement?.fill} onChange={e => handleElementChange(selectedElementId, {
                    fill: e.target.value
                })} className="hidden" // Hide the input
                />
            </div>


            <Button onClick={() => handleDeleteElement()} className="flex items-center gap-2 text-red-500 bg-transparent">
                <Trash className="w-4 h-4" />
            </Button>
        </div>
    )
}

export default TextEdit