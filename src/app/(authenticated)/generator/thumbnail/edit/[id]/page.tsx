"use client"
import Inpaint from '@/components/Thumbnail/Inpaint'
import ListEditedImages from '@/components/Thumbnail/ListEditedImages'
import { useGetImageByIdQuery, useGetImageInpaintsQuery, useSaveImageEditMutation } from '@/redux/api/image'
import React, { useEffect, useState } from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import ImageEditor from '@/components/ImageEditor/ImageEditor'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useGetUrlForUploadMutation } from '@/redux/api/app'
import { v4 } from 'uuid'
import { dataUriToBlob } from '@/lib/utils'
import axios from 'axios'

type TabType = "inpaint" | "edit"

const Page = ({ params }: { params: { id: string } }) => {
    const [selectedImageUrl, setSelectedImageUrl] = useState("")
    const [selectedTab, setSelectedTab] = useState<TabType>("inpaint")
    const { data } = useGetImageByIdQuery(params.id)

    const [getUrlForUplaodApi] = useGetUrlForUploadMutation()

    const { toast } = useToast()

    const [saveImageEditApi, { isLoading }] = useSaveImageEditMutation()

    useEffect(() => {
        if (data?.data) {
            setSelectedImageUrl(data.data.url)
        }
    }, [data])

    const { data: editedImages } = useGetImageInpaintsQuery(params.id)

    if (!data?.success) return "No Image found by this ID"


    const saveImageEdit = async (uri: string) => {
        try {
            const fileName = `${data.data.name}-edit-${v4()}.png`
            const putUrl = await getUrlForUplaodApi(fileName).unwrap()

            const blob = dataUriToBlob(uri);

            await axios.put(putUrl.data, blob, {
                headers: {
                    'Content-Type': blob.type, // Ensure correct MIME type is sent
                },
            });

            await saveImageEditApi({ id: params.id, uri: fileName }).unwrap()
            toast({ variant: "success", title: "Image saved successfully", duration: 1000 })
        } catch (error) {
            toast({ variant: "destructive", title: "Error occured while uploading" })
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-5">Image Editor</h1>

            <Tabs defaultValue={selectedTab} className="flex justify-center items-center w-full flex-col" onValueChange={(val) => setSelectedTab(val as TabType)} value={selectedTab}>
                <TabsList className='w-[200px]'>
                    <TabsTrigger value="inpaint" className='w-full'>
                        AI Inpaint
                    </TabsTrigger>
                    <TabsTrigger value="edit" className='w-full'>
                        Edit
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="inpaint" className='w-full mt-4'>
                    <Inpaint url={selectedImageUrl} imageProp={{ id: data?.data._id, title: data?.data.name, output_format: data?.data.output_format, size: data?.data.size }} />
                </TabsContent>
                <TabsContent value="edit" className='w-full outline-none mt-4 focus-visible:ring-white'>

                    <ImageEditor url={selectedImageUrl} renderTopBar={{
                        enable: true, element: ((getDataUri: () => string) => {
                            return <div className="flex gap-5 pt-2 w-full">
                                <Button className='w-32' onClick={() => saveImageEdit(getDataUri())} loading={{ isLoading, loader: "tailspin", width: 20, height: 20 }}>Save</Button>
                                <Button variant={"outline"} onClick={() => {
                                    setSelectedImageUrl(getDataUri())
                                    setSelectedTab("inpaint")
                                }}>Use this with Inpainter</Button>
                                <Button variant={"outline"} onClick={() => {
                                    setSelectedImageUrl(data.data.url)
                                }}>Use Original Image</Button>
                            </div>
                        })
                    }} />
                </TabsContent>
            </Tabs>
            {
                editedImages?.data?.length || data.data?.edits?.length ?
                    <ListEditedImages title={data.data.name} changeImage={(url) => setSelectedImageUrl(url)} data={[...(editedImages?.data || []), ...data.data?.edits].reverse()} /> : null
            }
            
        </>
    )
}

export default Page