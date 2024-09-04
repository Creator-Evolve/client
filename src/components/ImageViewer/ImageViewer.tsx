import React, { useState } from 'react'
import { Separator } from '../ui/separator'
import { TbExternalLink } from "react-icons/tb"

interface IProps {
    images: { context: string, title: string, thumbnail: string, link: string, size?: ISize }[],
    selectedIndex: number,
    mainImageStyle?: string
    fullWidth?: boolean
}

type ISize = "horizontal" | "vertical"

const ImageViewer: React.FC<IProps> = ({ images, selectedIndex = 0, mainImageStyle, fullWidth = false }) => {
    const [imgIndex, setImgIndex] = useState(selectedIndex)
    const [scale, setScale] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const imagesLen = images.length
    const halfLen = Math.round(imagesLen / 2) - (imagesLen % 2 !== 0 ? 1 : 0)
    const imagesArr1 = images.slice(0, halfLen)
    const imagesArr2 = images.slice(halfLen)

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        setScale(prevScale => Math.max(1, prevScale + e.deltaY * -0.01))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const resetZoom = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }

    return (
        <div className="h-screen">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl text-white font-semibold">{images[imgIndex].title}</h1>
                <a className="border-2 border-white mr-10 rounded flex justify-between items-start py-1 px-4 cursor-pointer hover:bg-black transition" target='_blank' href={images[imgIndex].context}>
                    <p className='text-white text-base mr-1'>Source</p>
                    <TbExternalLink size={15} className='text-white' />
                </a>
            </div>
            <Separator className='w-full my-4' />
            <div className="flex justify-between">
                <div className="w-full">
                    <div className="col-span-7 flex h-full w-full select-none items-center justify-center py-md pl-lg relative overflow-hidden"
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}>
                        <img
                            className={`max-w-96 cursor-move ${(fullWidth && images[imgIndex].size === "horizontal") ? "max-w-full w-full" : ""} ${mainImageStyle}`}
                            src={images[imgIndex].link}
                            alt=""
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                            }}
                        />
                    </div>
                </div>
                <div className="flex h-[calc(100vh-100px)] overflow-y-auto justify-between">
                    <div className="mr-2 w-full">
                        {imagesArr1.map((image, index) => (
                            <div key={index} className={`mb-2 cursor-pointer ${imgIndex === index ? "border-2 border-white" : ""}`} onClick={() => { setImgIndex(index); resetZoom(); }}>
                                <img src={image.link} className='w-96' alt="" />
                            </div>
                        ))}
                    </div>
                    <div className="w-full">
                        {imagesArr2.map((image, index) => (
                            <div key={halfLen + index} className={`mb-2 cursor-pointer ${imgIndex === (halfLen + index) ? "border-2 border-white" : ""}`} onClick={() => { setImgIndex(halfLen + index); resetZoom(); }}>
                                <img src={image.link} className='w-96' alt="" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageViewer