import React from 'react'
import NextImage from 'next/image';
import { RxExternalLink } from 'react-icons/rx';
import { MdDownload } from 'react-icons/md';
import { FaHandPointUp } from 'react-icons/fa';
import { downloadFile } from '@/lib/utils';
import { IImageEdit } from '@/redux/interfaces/image';
import { v4 } from "uuid"

interface IProps {
    data: (IImageEdit | { url: string })[],
    changeImage: (url: string) => void
    title: string
}

const ListEditedImages: React.FC<IProps> = ({ data, changeImage, title }) => {
    return (
        <div className='mt-5'>
            <h1 className="text-lg font-bold">Edited images</h1>
            <div className="flex mt-3 gap-5 justify-between flex-wrap">
                {data.map(image => <div className="relative ">
                    <div className="w-[400px] h-[231px] relative">
                        <NextImage src={image.url} layout='fill' objectFit='contain' alt="Image" className='rounded' />
                    </div>
                    <div className="absolute gap-3 top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 hover:opacity-100 transition duration-200 ease-in-out">
                        <div className="rounded-2xl border-white border p-2 text-white flex gap-2 cursor-pointer " onClick={() => changeImage(image.url)}>
                            <FaHandPointUp />
                            <p className='text-xs'>Use</p>
                        </div>
                        <a href={image.url} target='_blank' className="rounded-2xl border-white border p-2 text-white flex gap-2 cursor-pointer ">
                            <RxExternalLink />
                            <p className='text-xs'>Open</p>
                        </a>
                        <div className="rounded-2xl border-white border p-2 text-white flex gap-2 cursor-pointer " onClick={() => downloadFile(image.url, title || v4())}>
                            <MdDownload />
                            <p className='text-xs'>Donwload</p>
                        </div>
                    </div>
                </div>)
                }

            </div>

        </div>
    )
}

export default ListEditedImages