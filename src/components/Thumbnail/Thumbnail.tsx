"use client"
import React, { useEffect } from 'react'
import Custom from './Custom'
import { useDeleteImageByIdMutation, useGetGeneratedImagesQuery } from '@/redux/api/image'
import List from './List'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'


const Thumbnail = ({ page }: { page: number }) => {
    const { data, refetch } = useGetGeneratedImagesQuery({ page, limit: 7 }, { refetchOnMountOrArgChange: true })
    const [deleteImageByIdApi] = useDeleteImageByIdMutation()
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        refetch()
    }, [page, refetch])

    useEffect(() => {
        refetch()
    }, [])

    const updatePage = async (page: number) => {
        router.push(`?page=${page}`)
    }

    const onImageDeleteHandler = async (id: string) => {
        try {
            await deleteImageByIdApi(id).unwrap()
            toast({ title: "Image deleted successfully", variant: "success" })
            refetch()
        } catch (error) {
            toast({ title: "Image deleted failed", variant: "destructive" })

        }
    }
    return (
        <div className="">
            <h1 className="md:text-3xl text-2xl font-bold text-primary">Thumbnail Generator</h1>
            <p className="text-gray-500 text-sm font-medium">
                Create eye-catching thumbnails to boost your YouTube video&apos;s click-through rate. Choose from a variety of templates or generate custom images with AI-driven design suggestions. Customize your thumbnails with text, images, and branding elements to make your content stand out.
            </p>

            <Custom refetch={refetch} />
            {
                data?.data?.images &&
                <List images={data?.data.images} currentPage={data.data.pagination.currentPage} totalPage={data.data.pagination.totalPages} deleteHandler={onImageDeleteHandler} />
            }
        </div>
    )
}

export default Thumbnail