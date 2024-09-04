"use client"

import React, { useMemo, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { LuInfo } from 'react-icons/lu'
import { useGenerateTextToImageMutation } from '@/redux/api/image'
import Image from 'next/image'
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogClose } from '../ui/dialog'
import ImageViewer from '../ImageViewer/ImageViewer'
import { RxCross1 } from 'react-icons/rx'
import { HiDownload } from 'react-icons/hi'
import { downloadFile } from '@/lib/utils'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Inpaint from './Inpaint'
import { Switch } from '../ui/switch'
import { AiFillEdit } from 'react-icons/ai'
import { IGeneratedImage } from '@/redux/interfaces/image'
import Link from 'next/link'

export enum IMAGE_GENERATION_MODEL {
    DALLE = 'dall-e',
    STABLE_DIFFUSION = 'stable-diffusion',
    STABLE_DIFFUSION_D3 = 'stable-diffusion-d3',
}

export enum IMAGE_OUTPUT_FORMAT {
    WEBP = 'webp',
    PNG = 'png',
    JPEG = 'jpeg',
}

const models = [
    {
        id: 0,
        name: "Dall-E 3",
        value: IMAGE_GENERATION_MODEL.DALLE
    },
    {
        id: 1,
        name: "Stable Diffusion Ultra",
        value: IMAGE_GENERATION_MODEL.STABLE_DIFFUSION
    },
    {
        id: 2,
        name: "Stable Diffusion D3",
        value: IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3
    },
]

const outPutFormat = [
    {
        name: "Webp",
        value: IMAGE_OUTPUT_FORMAT.WEBP,
        allowed: [IMAGE_GENERATION_MODEL.STABLE_DIFFUSION]
    },
    {
        name: "Jpeg",
        value: IMAGE_OUTPUT_FORMAT.JPEG,
        allowed: [IMAGE_GENERATION_MODEL.STABLE_DIFFUSION, IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3]
    },
    {
        name: "Png",
        value: IMAGE_OUTPUT_FORMAT.PNG,
        allowed: [IMAGE_GENERATION_MODEL.STABLE_DIFFUSION, IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3]
    },
]

export enum IMAGE_QUALITY {
    HD = 'hd',
    STANDARD = 'standard',
}

export enum IMAGE_STYLE {
    VIVID = 'vivid',
    NATURAL = 'natural',
}

interface FormDefaultValues {
    prompt: string;
    negative_prompt: string;
    model: IMAGE_GENERATION_MODEL;
    output_format: IMAGE_OUTPUT_FORMAT;
    size: IMAGE_SIZE;
    quality: IMAGE_QUALITY;
    style: IMAGE_STYLE;
    number_of_images: number;
    enable_prompt_optimization: boolean
}

interface IProps {
    refetch: () => void
}

export enum IMAGE_SIZE {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}

const Custom: React.FC<IProps> = ({ refetch }) => {
    const [generatedThumbnails, setGeneratedThumbnails] = useState<IGeneratedImage[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)

    const form = useForm<FormDefaultValues>({
        defaultValues: {
            prompt: "",
            negative_prompt: "",
            model: IMAGE_GENERATION_MODEL.DALLE,
            output_format: IMAGE_OUTPUT_FORMAT.PNG,
            size: IMAGE_SIZE.HORIZONTAL,
            quality: IMAGE_QUALITY.HD,
            style: IMAGE_STYLE.VIVID,
            number_of_images: 1,
            enable_prompt_optimization: true
        }
    })

    const { setValue, watch } = form
    const [generateTextToImageApi, { isLoading }] = useGenerateTextToImageMutation()

    const onSubmitHandler = async (data: FormDefaultValues) => {
        try {
            const { model, negative_prompt, number_of_images, output_format, prompt, quality, style } = data
            const payload: any = {
                model, negative_prompt, number_of_images, output_format, prompt, quality, style,
                enable_prompt_optimization: data.enable_prompt_optimization
            }

            if (model === IMAGE_GENERATION_MODEL.DALLE) {
                payload["size"] = data.size === IMAGE_SIZE.HORIZONTAL ? "1792x1024" : "1024x1792"
            } else {
                payload["stability_aspect_ratio"] = data.size === IMAGE_SIZE.HORIZONTAL ? "16:9" : "9:16"
            }

            const resp = await generateTextToImageApi(payload).unwrap()
            setGeneratedThumbnails(prev => [...prev, ...resp.data])
            refetch()
        } catch (error) {
            console.log({ error })
        }
    }

    const modelVal = watch("model")
    const sizeVal = watch("size")

    const reversedThumbnails = useMemo(() => [...generatedThumbnails].reverse(), [generatedThumbnails]);

    return (
        <div className="mt-4 flex md:flex-row flex-col justify-between gap-6">
            <div className="w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitHandler)}>
                        <div className="">

                            <FormField control={form.control} name='prompt' render={(({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} className='resize-none mt-1 ' value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            ))} />
                            <div className="flex justify-end">

                                <FormField control={form.control} name='enable_prompt_optimization' render={({ field: { onChange, value } }) => (
                                    <FormItem className='flex justify-end'>
                                        <FormControl>
                                            <Switch className='mt-2' checked={value} onCheckedChange={onChange} />
                                        </FormControl>
                                        <h3 className='text-sm font-medium ml-2'>Optimize Prompt</h3>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                        <br />
                        {
                            modelVal !== IMAGE_GENERATION_MODEL.DALLE ?
                                <>
                                    <FormField control={form.control} name='negative_prompt' render={(({ field }) => (
                                        <FormItem>
                                            <FormLabel>Negative Prompt</FormLabel>
                                            <FormControl>
                                                <Input className='mt-1 ' value={field.value} onChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    ))} />
                                    <br />
                                </>
                                : null
                        }
                        <div className="flex justify-between gap-5" >
                            <FormField control={form.control} name="model" render={(({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='mr-4'>Model</FormLabel>
                                    <div className=" w-full">
                                        <Select onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Dall-E 3" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    models.map(model => (
                                                        <SelectItem key={model.id} value={model.value}>{model.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            ))} />
                            {
                                modelVal !== IMAGE_GENERATION_MODEL.DALLE ?
                                    <FormField control={form.control} name="output_format" render={(({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel className='mr-4'>Output Format</FormLabel>
                                            <div className="w-full">
                                                <Select onValueChange={(value) => field.onChange(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Png" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {
                                                            outPutFormat.map(format => format.allowed.includes(modelVal) && (
                                                                <SelectItem key={format.value} value={format.value}>{format.name}</SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </FormItem>
                                    ))} /> : null
                            }
                        </div>
                        <br />
                        <div className="flex justify-between flex-wrap gap-5 md:gap-0">
                            <FormField control={form.control} name="size" render={(({ field }) => (
                                <FormItem className=''>
                                    <FormLabel className='mr-4'>Thumnail Size</FormLabel>
                                    <div className="flex mt-3">
                                        <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("size", IMAGE_SIZE.VERTICAL)}>
                                            <div className={`flex justify-center items-center w-14 rounded h-14 bg-slate-100 ${field.value === IMAGE_SIZE.VERTICAL ? "border-primary border-3" : ""}`}>
                                                <div className="w-4 h-8 border-2 border-black"></div>
                                            </div>
                                            <p className='text-xs mt-1 text-center font-medium text-gray-500'>9:16</p>
                                        </div>
                                        <div className={`flex-col items-center justify-center cursor-pointer`} onClick={() => setValue("size", IMAGE_SIZE.HORIZONTAL)} >
                                            <div className={`flex justify-center items-center w-14 rounded h-14 bg-slate-100 ${field.value === IMAGE_SIZE.HORIZONTAL ? "border-primary border-3" : ""}`}>
                                                <div className="h-4 w-8 border-2 border-black"></div>
                                            </div>
                                            <p className='text-xs mt-1 text-center font-medium text-gray-500'>16:9</p>
                                        </div>
                                    </div>
                                </FormItem>
                            ))} />
                            {
                                modelVal === IMAGE_GENERATION_MODEL.DALLE ? <>
                                    <FormField control={form.control} name="quality" render={(({ field }) => (
                                        <FormItem className=''>
                                            <FormLabel className='mr-4'>Quality</FormLabel>
                                            <div className="flex mt-3">
                                                <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("quality", IMAGE_QUALITY.HD)}>
                                                    <div className={`flex justify-center items-center  rounded py-2 px-4 bg-slate-100 border-2 ${field.value === IMAGE_QUALITY.HD ? "border-primary border-2" : "border-white"}`}>
                                                        <p className="text-sm font-bold">HD</p>
                                                    </div>
                                                </div>
                                                <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("quality", IMAGE_QUALITY.STANDARD)}>
                                                    <div className={`flex justify-center items-center  rounded py-2 px-4 bg-slate-100 border-2  ${field.value === IMAGE_QUALITY.STANDARD ? "border-primary border-2" : "border-white"}`}>
                                                        <p className="text-sm font-bold">SD</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </FormItem>
                                    ))} />
                                    <FormField control={form.control} name="style" render={(({ field }) => (
                                        <FormItem className=''>
                                            <FormLabel className='mr-4 flex items-start'>Style <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <LuInfo size={12} className='ml-1 text-gray-600 font-bold' />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className='text-xs text-gray-700 max-w-72'>The style of the generated images. Must be one of vivid or natural. <br /> <br /> <b>Vivid</b> causes the model to lean towards generating hyper-real and dramatic images. <br /> <b>Natural</b> causes the model to produce more natural, less hyper-real looking images. </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider> </FormLabel>
                                            <div className="flex mt-3">
                                                <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("style", IMAGE_STYLE.VIVID)}>
                                                    <div className={`flex justify-center items-center  rounded py-2 px-4 bg-slate-100 border-2  ${field.value === IMAGE_STYLE.VIVID ? "border-primary border-2" : "border-white"}`}>
                                                        <p className="text-sm font-bold">Vivid</p>
                                                    </div>
                                                </div>
                                                <div className={`flex-col items-center justify-center cursor-pointer mr-5`} onClick={() => setValue("style", IMAGE_STYLE.NATURAL)}>
                                                    <div className={`flex justify-center items-center  rounded py-2 px-4 bg-slate-100 border-2 ${field.value === IMAGE_STYLE.NATURAL ? "border-primary border-2" : "border-white"}`}>
                                                        <p className="text-sm font-bold">Natural</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </FormItem>
                                    ))} />
                                </> : null
                            }
                        </div>
                        <br />
                        <FormField control={form.control} name="number_of_images" render={(({ field }) => (
                            <FormItem className=''>
                                <FormLabel className='mr-4'>Number of images</FormLabel>
                                <div className="flex items-center ">
                                    <h1 className='text-gray-500 '>0</h1>
                                    <FormControl className='mx-4 mb-1'>
                                        <Slider className='mt-2' defaultValue={[field.value]} max={5} showTooltip onValueChange={(vals) => field.onChange(vals[0])} />
                                    </FormControl>
                                    <h1 className='text-gray-500 '>5</h1>
                                </div>
                            </FormItem>
                        ))} />
                        <br />
                        <Button type="submit" disabled={isLoading} loading={{ isLoading, loader: "tailspin", width: 20, height: 20 }} className='md:w-40 w-full'>Generate Thumbnail</Button>
                    </form>
                </Form>
            </div>

            <div className="w-full">
                {
                    reversedThumbnails.length ?
                        <>
                            <h1 className='text-xl font-semibold mb-4 text-center' >Preview</h1>
                            <Dialog>
                                <div className="flex items-center justify-center mt-16">
                                    <Carousel orientation='vertical'>
                                        <CarouselContent className='h-[70vh]' >
                                            {
                                                reversedThumbnails.map((thumbnail, index) => (
                                                    <DialogTrigger asChild key={index} onClick={() => setSelectedIndex(index)}>
                                                        <CarouselItem className='md:basis-1/2'>
                                                            <div className="cursor-zoom-in relative">
                                                                <Image src={thumbnail.url} width={sizeVal === IMAGE_SIZE.HORIZONTAL ? 500 : 450} objectFit="cover" height={sizeVal === IMAGE_SIZE.HORIZONTAL ? 450 : 500} alt={"Generated image"} />
                                                                <div className="flex gap-1 absolute bottom-1 right-1">
                                                                    <Link passHref href={`/generator/thumbnail/edit/${thumbnail._id}`}>
                                                                        <div className=" p-2 group rounded-full border-2 border-white z-20 cursor-pointer hover:bg-gray-100 transition bg-black delay-100" onClick={(e) => {
                                                                            e.stopPropagation()
                                                                        }}>
                                                                            <AiFillEdit size={17} className='text-white group-hover:text-black' />
                                                                        </div>
                                                                    </Link>
                                                                    <div className=" p-2 rounded-full group border-2 border-white z-20 cursor-pointer hover:bg-gray-100 transition bg-black delay-100" onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        downloadFile(thumbnail.url, `thumbnail-${index}`)
                                                                    }}>
                                                                        <HiDownload size={17} className='text-white group-hover:text-black' />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CarouselItem>
                                                    </DialogTrigger>

                                                ))
                                            }
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>


                                </div>
                                <DialogContent className='max-w-full  bg-black \-opacity-90 py-0 !rounded-none' dialogOverlayClassName='p-0 rounded-none' showCloseButton={false}>
                                    <DialogHeader className='justify-end'>
                                        <DialogClose className='absolute top-2 right-2'>
                                            <div className="bg-offsetPlus dark:bg-offsetPlusDark text-textMain dark:text-textMainDark  md:hover:text-textOff md:dark:hover:text-textOffDark  focus:outline-none outline-none outline-transparent transition duration-300 ease-in-out   select-none  relative group/button  justify-center text-center items-center rounded-full cursor-point active:scale-95 origin-center whitespace-nowrap inline-flex text-base aspect-square h-10">
                                                <RxCross1 size={20} className='text-white' />
                                            </div>
                                        </DialogClose>
                                    </DialogHeader>
                                    <ImageViewer images={reversedThumbnails.map((data) => ({
                                        link: data.url,
                                        title: "",
                                        context: data.url,
                                        thumbnail: data.url
                                    }))} selectedIndex={selectedIndex} mainImageStyle='w-full max-w-full mr-4' />
                                </DialogContent>
                            </Dialog>
                        </>
                        : null
                }
            </div>
        </div>
    )
}

export default Custom