"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../ui/card';

import { trimText } from '@/lib/utils';
import { MdDelete, MdOutlineAddCircleOutline } from 'react-icons/md';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';

import { Button } from '../ui/button';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import VideoUploader, { DefaultVideoState } from '../common/VideoUploader';
import { IMedia, VIDEO_TYPES } from '@/constants/video';
import { useUploadVideoFileMutation, useUploadVideoUrlMutation } from '@/redux/api/media';
import { useToast } from '../ui/use-toast';
import { IVideoResponse } from '../reel-generator/types/video';
import { useRouter } from 'next/navigation';

interface IFormInput {
    input_url: string
}

const Subtitle = () => {
    const { control, handleSubmit } = useForm<IFormInput>();

    const [uploadYTVideoApi, { isLoading: ytVideoApiIsLoading }] = useUploadVideoUrlMutation();
    const [uploadVideoFileApi, { isLoading: videoFileApiIsLoading }] = useUploadVideoFileMutation();

    const [media, setMedia] = useState<IMedia>(DefaultVideoState);

    const router = useRouter()

    const isLoading = ytVideoApiIsLoading || videoFileApiIsLoading;

    const { toast } = useToast()

    const onSubmitHandler: SubmitHandler<IFormInput> = async (data) => {
        if (!media) return
        try {
            const res: IVideoResponse = await handleVideoUpload(media)
            router.push(`/generator/subtitle/${res._id}`)
        } catch (error) {
            toast({ title: "Video uploaded successfully", description: "Your video was uploaded successfully. It will take around 5 minutes to process your video.", variant: "success" });
        }
    }

    const handleVideoUpload = async (video: IMedia) => {
        try {
            if (video.type === VIDEO_TYPES.YOUTUBE) {
                const response = await uploadYTVideoApi({ url: video.data as string, thumbnail: video.thumbnail as string, name: video.title as string, store: true }).unwrap();
                if (response.success) {
                    toast({ title: "Video uploaded successfully", description: "Your YouTube video was uploaded successfully.", variant: "success" });
                }
                return response.data
            } else {
                const formData = new FormData();
                formData.append("video", video.data);
                const response = await uploadVideoFileApi(formData).unwrap();
                if (response.success) {
                    toast({ title: "Video uploaded successfully", description: "Your video was uploaded successfully.", variant: "success" });
                }
                return response.data
            }
        } catch (error) {
            toast({ title: "Video upload failed", description: "Video upload failed due to some reason, please try again.", variant: "destructive" });
            throw error;
        }
    };

    const onDeleteById = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
    }
    
    return (
        <div>
            <h1 className="md:text-3xl text-2xl font-bold text-primary">Subtitle Generator</h1>
            <p className="text-gray-500 text-sm font-medium">
                Elevate your video content with professional subtitles that captivate and inform. Whether you&apos;re aiming for accessibility or multilingual reach, our Subtitle Generator offers customizable templates and styling options to perfectly match your brand. Easily add polished subtitles to your videos or download them for future projects.
            </p>


            <div className="flex mt-10">
                <div className="flex flex-wrap gap-5">
                    <Dialog>
                        <DialogTrigger>
                            <div className="cursor-pointer w-52 mr-4 flex bg-black text-white items-center space-y-1.5 p-6 h-20 shadow-sm rounded-lg border  text-card-foreground">
                                <div className="flex justify-between w-full">
                                    <MdOutlineAddCircleOutline size={40} />
                                    <h1 className="mt-2">New Research</h1>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader className='text-xl font-bold'>Upload video to get started</DialogHeader>
                            <form onSubmit={handleSubmit(onSubmitHandler)}>
                                {/* <div className="mb-2">
                                    <Label>Name</Label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{ required: "Name is required" }}
                                        render={({ field }) => (
                                            <Input {...field} />
                                        )}
                                    />
                                </div> */}
                                <div className="mb-4 w-full">
                                    {/* <Label>Video</Label> */}
                                    <Controller
                                        name="input_url"
                                        control={control}
                                        render={({ field }) => (
                                            <VideoUploader onUpload={async (video) => setMedia(video)} isLoading={isLoading} hide={{ fileInfoMsg: true, header: true }} customUpload />
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full" loading={{ isLoading, loader: "tailspin",width:20,height:20 }} disabled={isLoading}>
                                    Upload
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    {/* TO LIST THE GENERATED VIDEO SUBTITLE */}
                    {/* {data?.data && data.data.map(research => (
                        <Link href={`/research/${research._id}`} passHref key={research._id}>
                            <Card className="cursor-pointer w-56 mr-4 h-20 hover:bg-gray-200 transition duration-300  flex items-center relative" key={research._id} >
                                <CardHeader className="font-semibold">{trimText(research.name, 20)}</CardHeader>
                                <div className="flex items-center justify-center absolute w-8 h-8 top-1 right-1 border-1 bg-gray-100  rounded-full" onClick={(e) => onDeleteById(research._id, e)}>
                                    <MdDelete className="text-red-500" size={15} />
                                </div>
                            </Card>
                        </Link>
                    ))} */}
                </div>
            </div>
        </div>
    )
}

export default Subtitle