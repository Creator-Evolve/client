"use client"
import { useGetVideoByIdQuery } from '@/redux/api/media'
import Image from 'next/image'
import React, { useRef } from 'react'
import VideoPlayer from './VideoEditor'

interface IProps {
    id: string
}


const Create: React.FC<IProps> = ({ id }) => {
    const { data } = useGetVideoByIdQuery(id)


    if (!data?.success) return <h1>No video with this ID</h1>

    return (
        <div>
            <h1 className="text-3xl font-bold">{data.data.name}</h1>


            {/* <Image alt={data.data.name} src={data.data.thumbnail} width={500} height={300} objectFit='contain' /> */}

            <div className="flex mt-8">
            <VideoPlayer url={data.data.youtube_download_url} />
            <div className=""></div>
            </div>
        </div>
    )
}

export default Create