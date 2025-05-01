import { IGeneratedImage } from '@/redux/interfaces/image'
import Image from 'next/image'
import React, { useState } from 'react'
import { MdDelete, MdZoomOutMap } from 'react-icons/md'
import { IMAGE_GENERATION_MODEL } from './Custom'
import { Button } from '../ui/button'
import { BiSolidDownload } from 'react-icons/bi'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog'
import { RxCross1 } from 'react-icons/rx'
import ImageViewer from '../ImageViewer/ImageViewer'
import { downloadFile } from '@/lib/utils'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { FaEdit } from 'react-icons/fa'
import Link from 'next/link'


interface IProp {
    images: IGeneratedImage[]
    totalPage: number
    currentPage: number
    deleteHandler: (id: string) => void
}


const getModelDisplayName = (engine: IMAGE_GENERATION_MODEL) => {
    switch (engine) {
        case IMAGE_GENERATION_MODEL.DALLE:
            return 'DALL-E';
        case IMAGE_GENERATION_MODEL.STABLE_DIFFUSION:
            return 'Stable Diffusion';
        case IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3:
            return 'Stable Diffusion D3';
        default:
            return 'Unknown Model';
    }
};

const getOrientation = (size: string) => {
    if (size === "1792x1024" || size === "16:9") {
        return "horizontal";
    }
    if (size === "1024x1792" || size === "9:16") {
        return "vertical";
    }
    return "horizontal";  // Default to horizontal if size doesn't match any specific case
}


const List: React.FC<IProp> = ({ images, currentPage, totalPage, deleteHandler }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const renderImage = (size: string, url: string, name: string) => {
        let objectFit = "cover";

        if (size === "1024x1792" || size === "9:16") {
            objectFit = "contain";
        }

        return (
            <div className="relative w-[500px] h-[250px] rounded-sm cursor-zoom-in">
                <Image
                    src={url}
                    layout="fill"
                    objectFit={objectFit}
                    alt={name}
                    className="rounded-sm"
                />
            </div>
        );
    }
    return (
        <div className="mt-10">
            <h1 className='text-2xl font-semibold'>Generated Images List</h1>

            <div className="mt-6">
                <Dialog>
                    {
                        images.map((image, index) => (
                            <div className="flex md:flex-row flex-col mb-7 items-stretch" key={image._id}>
                                <DialogTrigger asChild>
                                    <div className="relative mr-2 flex-shrink-0" onClick={() => setSelectedIndex(index)}>
                                        <div className="w-full md:w-auto">
                                            {renderImage(image.engine === IMAGE_GENERATION_MODEL.DALLE ? image.size : image.aspect, image.url, image.name)}
                                        </div>
                                        <div className="absolute inset-0 opacity-0 hover:opacity-100 flex justify-center items-center bg-black bg-opacity-50 transition duration-200 ease-in-out rounded cursor-zoom-in">
                                            <MdZoomOutMap size={40} className='text-white' />
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className='text-lg font-semibold'>{image.name}</p>
                                        <p className='text-gray-500 text-sm font-medium'>{image.prompt}</p>
                                    </div>
                                    <div className='flex gap-4 justify-between flex-col md:flex-row mt-2'>
                                        <div className="flex gap-4">
                                            <p className='text-sm text-gray-600 font-medium'><span className='font-semibold text-black'>Model:</span> {getModelDisplayName(image.engine as IMAGE_GENERATION_MODEL)}</p>
                                            <p className='text-sm text-gray-600 font-medium'><span className='font-semibold text-black'>Cost:</span> {50} tokens</p>
                                        </div>

                                        <div className="flex">
                                            <Button className='mr-2  w-full md:w-auto' onClick={() => downloadFile(image.url, image.name)}><BiSolidDownload size={17} className='mr-1' /> Download</Button>
                                            <Link passHref href={`/generator/thumbnail/edit/${image._id}`}>
                                                <Button variant={"secondary"} className=' w-full  mr-2 md:w-auto'><FaEdit size={17} className='mr-1' /> Edit</Button>
                                            </Link>
                                            <Button variant={"destructive"} onClick={() => deleteHandler(image._id)} className='text-white  w-full md:w-auto'><MdDelete size={17} className='mr-1' /> Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    <DialogContent className='max-w-full  bg-black \-opacity-90 py-0 !rounded-none' dialogOverlayClassName='p-0 rounded-none' showCloseButton={false}>
                        <DialogHeader className='justify-end'>
                            <DialogClose className='absolute top-2 right-2'>
                                <div className="bg-offsetPlus dark:bg-offsetPlusDark text-textMain dark:text-textMainDark  md:hover:text-textOff md:dark:hover:text-textOffDark  focus:outline-none outline-none outline-transparent transition duration-300 ease-in-out   select-none  relative group/button  justify-center text-center items-center rounded-full cursor-point active:scale-95 origin-center whitespace-nowrap inline-flex text-base aspect-square h-10">
                                    <RxCross1 size={20} className='text-white' />
                                </div>
                            </DialogClose>
                        </DialogHeader>
                        <ImageViewer images={images.map((data) => ({
                            link: data.url,
                            title: data.name,
                            context: data.prompt,
                            thumbnail: data.url,
                            size: getOrientation(data.engine === IMAGE_GENERATION_MODEL.DALLE ? data.size : data.aspect)
                        }))} selectedIndex={selectedIndex} fullWidth mainImageStyle='mr-4' />
                    </DialogContent>

                </Dialog>

            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem >
                        <PaginationPrevious href={`?page=${currentPage - 1}`} />
                    </PaginationItem>
                    {Array.from({ length: totalPage }, (_, i) => i).map((val) => (
                        <PaginationItem key={val}>
                            <PaginationLink href={`?page=${val + 1}`}
                                isActive={val + 1 === currentPage}
                            >
                                {val + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {
                        totalPage > 8 ?
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem> : null
                    }
                    {

                    }
                    <PaginationItem>
                        <PaginationNext href={`?page=${currentPage + 1}`} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div >
    )
}

export default List