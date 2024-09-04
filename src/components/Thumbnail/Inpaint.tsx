import { IMAGE_GENERATION_MODEL, IMAGE_OUTPUT_FORMAT, IMAGE_QUALITY, IMAGE_SIZE, IMAGE_STYLE } from '@/redux/interfaces/enum';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useUploadFileMutation } from '@/redux/api/app';
import { extractExtension } from '@/lib/utils';
import { v4 } from "uuid";
import { useInpaintImageMutation, useRemoveBackgroundMutation } from '@/redux/api/image';
import { Switch } from '../ui/switch';

interface InpaintProps {
    url: string;
    imageProp: {
        size: IMAGE_SIZE;
        output_format: IMAGE_OUTPUT_FORMAT;
        title?: string;
        id: string;
    };
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
    mask_data_uri: string;
    enable_prompt_optimization: boolean
}

const Inpaint: React.FC<InpaintProps> = ({ url, imageProp }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<{ width: number, height: number } | null>(null);

    const [editedImage, setEditedImage] = useState<string>()
    const [selectedImageUrl, setSelectedImageUrl] = useState(url)

    const [fileUploadApi, { isLoading: isFileUploadApiLoading }] = useUploadFileMutation();
    const [editImageApi, { isLoading: isEditImageApiLoading }] = useInpaintImageMutation();
    const [removeBgApi, { isLoading: isRemoveBgApiLoading }] = useRemoveBackgroundMutation()

    const isLoading = isFileUploadApiLoading || isEditImageApiLoading

    const { output_format, size } = imageProp;

    const form = useForm<FormDefaultValues>({
        defaultValues: {
            model: IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3,
            output_format,
            size,
            enable_prompt_optimization: true
        }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const hiddenCtx = hiddenCanvas?.getContext('2d');

        if (canvas && ctx && hiddenCanvas && hiddenCtx) {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Enable CORS for the image
            img.onload = () => {
                const windowWidth = window.innerWidth / 2;
                const windowHeight = window.innerHeight / 2;
                const aspectRatio = img.width / img.height;

                let canvasWidth, canvasHeight;

                if (aspectRatio > 1) {
                    canvasWidth = windowWidth;
                    canvasHeight = windowWidth / aspectRatio;
                    if (canvasHeight > windowHeight) {
                        canvasHeight = windowHeight;
                        canvasWidth = windowHeight * aspectRatio;
                    }
                } else {
                    canvasHeight = windowHeight;
                    canvasWidth = windowHeight * aspectRatio;
                    if (canvasWidth > windowWidth) {
                        canvasWidth = windowWidth;
                        canvasHeight = windowWidth / aspectRatio;
                    }
                }

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                hiddenCanvas.width = img.width;
                hiddenCanvas.height = img.height;

                setOriginalSize({ width: img.width, height: img.height });

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                hiddenCtx.clearRect(0, 0, img.width, img.height);
                hiddenCtx.drawImage(img, 0, 0, img.width, img.height);

                hiddenCtx.fillStyle = 'black';
                hiddenCtx.fillRect(0, 0, img.width, img.height);

                setError(null);
            };
            img.onerror = () => {
                setError("Failed to load image. Please check the URL.");
            };
            img.src = url;
        }
    }, [url]);

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const hiddenCtx = hiddenCanvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.beginPath(); // Reset the current path to avoid connecting lines
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            ctx.moveTo(x, y);
        }
        if (hiddenCtx && canvas && hiddenCanvas) {
            hiddenCtx.beginPath(); // Reset the current path to avoid connecting lines
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const scaleX = hiddenCanvas.width / canvas.width;
            const scaleY = hiddenCanvas.height / canvas.height;
            const hiddenX = x * scaleX;
            const hiddenY = y * scaleY;
            hiddenCtx.moveTo(hiddenX, hiddenY);
        }
        draw(event);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const hiddenCtx = hiddenCanvas?.getContext('2d');

        if (canvas && hiddenCanvas && ctx && hiddenCtx) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Calculate the corresponding coordinates on the hidden canvas
            const scaleX = hiddenCanvas.width / canvas.width;
            const scaleY = hiddenCanvas.height / canvas.height;
            const hiddenX = x * scaleX;
            const hiddenY = y * scaleY;

            // Updated drawing style
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Fully white
            ctx.lineWidth = 30; // Wider stroke
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round'; // Smooth line joins

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            hiddenCtx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Fully white
            hiddenCtx.lineWidth = 30 * scaleX; // Wider stroke scaled to the hidden canvas
            hiddenCtx.lineCap = 'round';
            hiddenCtx.lineJoin = 'round'; // Smooth line joins

            hiddenCtx.lineTo(hiddenX, hiddenY);
            hiddenCtx.stroke();
            hiddenCtx.beginPath();
            hiddenCtx.moveTo(hiddenX, hiddenY);
        }
    };

    const removeBackgroundHandler = async (url: string) => {
        try {
            const resp = await removeBgApi({ id: imageProp.id, imageUrl: url }).unwrap()
            replaceCanvasImage(resp.data)
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    const onSubmitHandler = async (data: FormDefaultValues) => {
        try {
            const hiddenCanvas = hiddenCanvasRef.current;
            const extension = extractExtension(url);
            if (hiddenCanvas) {
                const dataUrl = hiddenCanvas.toDataURL('image/png');
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `${imageProp.title || v4()}.${extension}`, { type: 'image/png' });

                const formData = new FormData();
                formData.append('file', file);
                formData.append('data', JSON.stringify(data));

                const response = await fileUploadApi(formData).unwrap();

                const res = await editImageApi({
                    image_id: imageProp.id, editData: {
                        model: IMAGE_GENERATION_MODEL.STABLE_DIFFUSION,
                        output_format: IMAGE_OUTPUT_FORMAT.PNG,
                        mask_url: response.data.key,
                        image_url: selectedImageUrl,
                        prompt: data.prompt,
                        negative_prompt: data.negative_prompt,
                        enable_prompt_optimization: data.enable_prompt_optimization
                    }
                }).unwrap();

                setEditedImage(res.data)
                replaceCanvasImage(res.data)
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const clearMask = () => {
        replaceCanvasImage(selectedImageUrl);
    };

    const replaceCanvasImage = (imgUrl: string) => {
        const canvas = canvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const hiddenCtx = hiddenCanvas?.getContext('2d');

        setSelectedImageUrl(imgUrl)

        if (canvas && ctx && hiddenCanvas && hiddenCtx && originalSize) {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Enable CORS for the image
            img.onload = () => {
                const windowWidth = window.innerWidth / 2;
                const windowHeight = window.innerHeight / 2;
                const aspectRatio = img.width / img.height;

                let canvasWidth, canvasHeight;

                if (aspectRatio > 1) {
                    canvasWidth = windowWidth;
                    canvasHeight = windowWidth / aspectRatio;
                    if (canvasHeight > windowHeight) {
                        canvasHeight = windowHeight;
                        canvasWidth = windowHeight * aspectRatio;
                    }
                } else {
                    canvasHeight = windowHeight;
                    canvasWidth = windowHeight * aspectRatio;
                    if (canvasWidth > windowWidth) {
                        canvasWidth = windowWidth;
                        canvasHeight = windowWidth / aspectRatio;
                    }
                }

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                hiddenCanvas.width = img.width;
                hiddenCanvas.height = img.height;

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                hiddenCtx.clearRect(0, 0, img.width, img.height);
                hiddenCtx.drawImage(img, 0, 0, img.width, img.height);

                hiddenCtx.fillStyle = 'black';
                hiddenCtx.fillRect(0, 0, img.width, img.height);
            };
            img.src = imgUrl;

        }
    };


    return (
        <>
            <div className='flex justify-start items-start w-full gap-8'>
                <div className="w-full flex items-center justify-center">
                    <div className="">
                        <p className="text-sm text-center text-gray-600">Select an area for edit</p>
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseUp={stopDrawing}
                            onMouseMove={draw}
                            onMouseLeave={stopDrawing}
                            style={{ border: '1px solid black', cursor: 'crosshair' }}
                        />
                        <div className="flex justify-center items-start mt-2">
                            <Button variant={"secondary"} className='rounded-full mr-4 w-42' disabled={isRemoveBgApiLoading} loading={{ isLoading: isRemoveBgApiLoading, width: 20, height: 20, loader: "tailspin", color: "black" }} onClick={() => removeBackgroundHandler(selectedImageUrl)}>Remove background</Button>
                            {
                                url !== selectedImageUrl &&
                                <Button variant={"outline"} className='rounded-full' onClick={() => replaceCanvasImage(url)}>Use original Image</Button>
                            }
                        </div>
                    </div>
                    <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
                </div>

                <div className="w-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitHandler)}>
                            <div className="relative">
                                <FormField control={form.control} name='prompt' render={(({ field }) => (
                                    <FormItem>
                                        <FormLabel className='mb-0'>Prompt</FormLabel>
                                        <FormDescription className='!mt-0 text-xs'>What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects will lead to better results.</FormDescription>
                                        <FormControl>
                                            <Textarea rows={4} className='resize-none mt-1 ' value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage>
                                            {/* {
                                        !field.value.length && <>Error oc</>
                                    } */}
                                        </FormMessage>
                                    </FormItem>
                                ))} />

                                <FormField control={form.control} name='enable_prompt_optimization' render={({ field: { onChange, value } }) => (
                                    <FormItem className='flex justify-end'>
                                        <FormControl>
                                            <Switch className='mt-2' checked={value} onCheckedChange={onChange} />
                                        </FormControl>
                                        <h3 className='text-sm font-medium ml-2'>Optimize Prompt</h3>
                                    </FormItem>
                                )} />
                            </div>
                            {/* <br /> */}

                            {/* <FormField control={form.control} name='negative_prompt' render={(({ field }) => (
                            <FormItem>
                                <FormLabel>Negative Prompt</FormLabel>
                                <FormControl>
                                    <Input className='mt-1 ' value={field.value} onChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        ))} /> */}
                            {/* <br /> */}


                            <div className="flex items-start">
                                <Button type='submit' loading={{ isLoading, loader: "tailspin", width: 25, height: 25 }} disabled={isLoading} className='w-28' >Edit Image</Button>
                                <Button type='button' className="ml-5" variant={"outline"} onClick={clearMask}>Clear mask</Button>
                            </div>

                            <br />

                            {/* {
                                editedImage &&
                                <div className="flex">
                                    <div className="relative ">
                                        <div className="w-[300px] h-[174px] relative">
                                            <NextImage src={editedImage} layout='fill' objectFit='contain' alt="Image" className='rounded' />
                                        </div>
                                        <div className="absolute gap-3 top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 hover:opacity-100 transition duration-200 ease-in-out" >
                                            <a href={editedImage} target='_blank' className="rounded-2xl border-white border p-2 text-white flex gap-2 cursor-pointer ">
                                                <RxExternalLink />
                                                <p className='text-xs'>Open</p>
                                            </a>
                                            <div className="rounded-2xl border-white border p-2 text-white flex gap-2 cursor-pointer " onClick={() => downloadFile(url, imageProp.title || v4())}>
                                                <MdDownload />
                                                <p className='text-xs'>Donwload</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            } */}
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default Inpaint;
