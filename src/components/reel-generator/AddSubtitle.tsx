import React, { useEffect, useRef, useState } from 'react'
import { VideoDimension } from './DetailPage'
import { Form, FormField, FormItem, FormLabel, FormControl } from '../ui/form'
import { useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { Button } from '../ui/button'
import { useAddSubtitleToShortMutation } from '@/redux/api/media'
import { useToast } from '../ui/use-toast'
import { TbBold, TbBoldOff, TbItalic } from 'react-icons/tb'
import { FaItalic } from 'react-icons/fa'
import { fonts, fontSizes, outlineSizes, subtitlePositions } from './types/font'

interface IProp {
    frame: VideoDimension;
    metadata: {
        width: number;
        height: number;
    };
    thumbnail: string;
    shortId: string;
}

interface ISubtitleForm {
    bg_color?: string;
    font_color?: string;
    font?: string;
    font_size?: string;
    position?: "top" | "bottom";
    bold: boolean
    italic: boolean,
    outline: number,
    outline_color?: string
}

const AddSubtitle: React.FC<IProp> = ({ frame, metadata, thumbnail, shortId }) => {
    const [color, setColor] = useColor("#FFFF00");
    const [bgColor, setBgColor] = useColor("#ffff0000");
    const [outlineColor, setOutlineColor] = useColor("#000000");

    const [addSubtitleToShortApi, { isLoading: isAddSubtitleToShortApiLoading }] = useAddSubtitleToShortMutation()
    const [preview, setPreview] = useState<{ show: boolean, url: string }>({ show: false, url: "" })

    const [scaledDimensions, setScaledDimensions] = useState<{ width: null | number, height: null | number }>({ width: null, height: null });

    const containerRef = useRef<HTMLDivElement>(null);

    const form = useForm<ISubtitleForm>({
        defaultValues: {
            font: "Arial",
            font_size: "14px",
            font_color: color.hex,
            position: "bottom",
            bg_color: "",
            bold: false,
            italic: false,
            outline: 0,
            outline_color: outlineColor.hex
        }
    })
    const { handleSubmit, watch } = form
    const watchedValues = watch()

    const { toast } = useToast()

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const maxWidth = containerRef.current.offsetWidth;
                const maxHeight = containerRef.current.offsetHeight;

                const aspectRatio = metadata.width / metadata.height;

                let newWidth, newHeight;

                if (metadata.width > metadata.height) {
                    // Landscape
                    newWidth = 398;
                    newHeight = 224;
                } else {
                    // Portrait or square
                    newHeight = Math.min(maxHeight, metadata.height);
                    newWidth = newHeight * aspectRatio;
                }

                setScaledDimensions({
                    width: Math.floor(newWidth),
                    height: Math.floor(newHeight)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [metadata]);


    const onSubmitHandler = async (data: ISubtitleForm) => {
        try {
            const resp = await addSubtitleToShortApi({
                shortId, style: {
                    ...data
                }
            }).unwrap()
            setPreview({ show: true, url: resp.data.captionated_url as string })
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to add subtitle", description: "Failed to add subtitle, please try again" })

        }
    }

    const getTextShadow = (outlineSize: number, outlineColor: string) => {
        const size = outlineSize;
        const color = outlineColor;

        const shadows = [];
        for (let x = -size; x <= size; x++) {
            for (let y = -size; y <= size; y++) {
                if (x !== 0 || y !== 0) {
                    shadows.push(`${x}px ${y}px 0 ${color}`);
                }
            }
        }
        return shadows.join(', ');
    };

    return (
        <div className="">
            <h1 className="text-lg font-medium">Add Subtitle</h1>

            <div className="flex mt-2" ref={containerRef}>
                <div className="w-full pr-4 flex justify-center items-center relative">
                    {
                        (preview.url && !preview.show) ?
                            <Button variant={"outline"} className="absolute bottom-0 left-0" onClick={() => setPreview((prev) => ({ ...prev, show: true }))}>Show Preview</Button> : null
                    }
                    {
                        (scaledDimensions.width && scaledDimensions.height) ?
                            <div
                                className="border rounded-md bg-white"
                                style={{
                                    width: scaledDimensions.width,
                                    height: scaledDimensions.height,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: watchedValues.position === 'top' ? 'flex-start' : 'flex-end',
                                    alignItems: 'center',
                                    position: 'relative',
                                    backgroundImage: `url(${thumbnail})`,
                                    backgroundPosition: "center",
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                }}
                            >

                                {
                                    (preview.show && preview.url) ? <video src={preview.url} controls /> :
                                        <div style={{
                                            padding: '5px',
                                            textAlign: 'center',
                                            width: '100%',
                                        }}>
                                            <p
                                                className="inline-block w-fit px-1 rounded-sm"
                                                style={{
                                                    background: watchedValues.bg_color,
                                                    fontFamily: watchedValues.font,
                                                    fontSize: watchedValues.font_size,
                                                    color: watchedValues.font_color,
                                                    fontWeight: watchedValues.bold ? 'bold' : 'normal',
                                                    fontStyle: watchedValues.italic ? 'italic' : 'normal',
                                                    textShadow: watchedValues.outline > 0 ? getTextShadow(watchedValues.outline, watchedValues.outline_color as string) : "none"

                                                }}
                                            >
                                                Sample Subtitle Text
                                            </p>
                                        </div>
                                }
                            </div>
                            : null
                    }
                </div>
                <div className="w-full">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmitHandler)} onChange={() => setPreview((prev) => ({ ...prev, show: false }))}>
                            <FormField name='font' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-sm'>Font</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Arial" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    fonts.map(font => (
                                                        <SelectItem style={{ fontFamily: font.value }} key={font.value} value={font.value}>{font.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            <br />
                            <FormField name='font_size' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-sm'>Font Size</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="14" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    fontSizes.map(font => (
                                                        <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            <br />
                            <div className="flex gap-3">
                                <FormField name='font_color' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        <FormLabel className='text-sm  mr-3'>Font Color</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger>
                                                    <div className="flex border p-2 rounded">
                                                        <div className="w-5 h-5 rounded-full" style={{ background: color.hex }}></div>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent >
                                                    <ColorPicker color={color} onChange={(color) => {
                                                        setColor(color)
                                                        field.onChange(color.hex)
                                                        setPreview((prev) => ({ ...prev, show: false }))
                                                    }} height={100} />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <br />
                                <FormField name='bg_color' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        <FormLabel className='text-sm  mr-3'>Background Color</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger>
                                                    <div className="flex border p-2 rounded">
                                                        <div className="w-5 h-5 rounded-full" style={{ background: bgColor.hex }}></div>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent >
                                                    <ColorPicker color={bgColor} onChange={(color) => {
                                                        setBgColor(color)
                                                        field.onChange(bgColor.hex)
                                                        setPreview((prev) => ({ ...prev, show: false }))
                                                    }} height={100} />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <br />
                            <div className="flex gap-3">
                                <FormField name='bold' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        {/* <FormLabel className='text-sm  mr-3'>bold</FormLabel> */}
                                        <FormControl>
                                            <div className={`flex border-2 p-2 w-12 h-12 items-center justify-center  rounded cursor-pointer ${field.value ? "bg-black text-white" : "bg-transparent"}`} onClick={() => field.onChange(!field.value)}>
                                                <TbBold size={20} />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <br />
                                <FormField name='italic' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        <FormControl>
                                            <div className={`flex border-2 p-2  w-12 h-12 items-center justify-center rounded cursor-pointer ${field.value ? "bg-black text-white" : "bg-transparent"}`} onClick={() => field.onChange(!field.value)}>
                                                <TbItalic size={20} />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <br />
                            <div className="flex items-center justify-between " >
                                <FormField name='outline' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        <FormLabel className='text-sm w-[10vw]'>Outline Size</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="0" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        outlineSizes.map(outline => (
                                                            <SelectItem key={outline.value} value={outline.value.toString()}>{outline.label}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField name='outline_color' render={({ field }) => (
                                    <FormItem className='flex items-center'>
                                        <FormLabel className='text-sm  mr-3'>Outline Color</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger>
                                                    <div className="flex border p-2 rounded">
                                                        <div className="w-5 h-5 rounded-full" style={{ background: outlineColor.hex }}></div>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent >
                                                    <ColorPicker color={outlineColor} onChange={(color) => {
                                                        setOutlineColor(color)
                                                        field.onChange(outlineColor.hex)
                                                        setPreview((prev) => ({ ...prev, show: false }))
                                                    }} height={100} />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <br />
                            <FormField name='position' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-sm'>Subtile Position</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="At Bottom" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    subtitlePositions.map(font => (
                                                        <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            <br />
                            <Button className='w-full' disabled={isAddSubtitleToShortApiLoading} loading={{ isLoading: isAddSubtitleToShortApiLoading, loader: "tailspin", width: 20, height: 20 }} type="submit">Generate Subtitle</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default AddSubtitle