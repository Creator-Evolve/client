"use client";
import { useGetVoicesChangedListQuery, useGetVoicesListQuery, useSpeechToSpeechMutation } from '@/redux/api/media';
import { VoiceSelector } from './VoiceSelector';
import { CiSettings } from "react-icons/ci";
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form';
import { DEFAULT_VOICE_ID } from '@/constants/audio';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { downloadFile, trimText } from '@/lib/utils';
import { ChangeEvent, useEffect, useState } from 'react';
import { MdDownload, MdPlayArrow } from 'react-icons/md';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import CustomVideoPlayer from '../CustomVideoPlayer/CustomVideoPlayer';
import AudioRecorder from '../AudioRecorder/AudioRecorder';
import { Input } from '../ui/input';
import { useUploadFileMutation } from '@/redux/api/app';
import { v4 as uuid } from "uuid"

// Define Zod schema
const formSchema = z.object({
    voice_id: z.string().nullable(),
    audio_url: z.string().nonempty({ message: "Audio is required" }),
    stability: z.number().min(0).max(100),
    similarity_boost: z.number().min(0).max(100),
    style: z.number().min(0).max(100),
    use_speaker_boost: z.boolean().default(true),
    name: z.string().nullable()
});

type FormData = z.infer<typeof formSchema>;

const VoiceChanger = () => {
    const { data: voicesList } = useGetVoicesListQuery("");

    const [speechToSpeechApi, { isLoading }] = useSpeechToSpeechMutation()
    const [fileUploadApi] = useUploadFileMutation()
    const { data } = useGetVoicesChangedListQuery()

    const [dialogState, setDialogState] = useState({ recorder: false })

    const [recordedAudio, setRecordedAudio] = useState<{ url: string, s3_key: string }>({ s3_key: "", url: "" })

    const { toast } = useToast()

    const [generatedSpeech, setGeneratedSpeech] = useState<{ name: string, url: string, voice_id: string, changed_voice_url: string, voiceName: string }[]>([])

    useEffect(() => {
        if (data?.data) {
            const generatedVoicesArr = data.data.map((data) => {
                const voiceName = voicesList?.data.public.find((voice) => voice.id === data.voice_id)?.name
                    || voicesList?.data.private.find((voice) => voice.id === data.voice_id)?.name
                    || 'Unknown Voice';
                return { ...data, voiceName };
            });
            setGeneratedSpeech(generatedVoicesArr);
        }
    }, [data?.data])

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            voice_id: DEFAULT_VOICE_ID,
            audio_url: "",
            name: "",
            stability: 50,
            similarity_boost: 75,
            style: 0,
            use_speaker_boost: true
        },
    });
    const { setValue } = form


    const onSubmit = async (data: FormData) => {
        if (!data.voice_id) return

        try {
            await speechToSpeechApi({ voice_id: data.voice_id, audio_url: data.audio_url, name: data.name as string }).unwrap()
        } catch (error) {
            toast({ title: "Error occured", description: "Error Occured while performing voice synthesis, please try again", variant: "destructive" })
            console.log({ error })
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        try {
            if (e.target.files) {
                const formData = new FormData()
                formData.append("file", e.target.files[0])

                const response = await fileUploadApi(formData).unwrap();

                setRecordedAudio({ s3_key: response.data.key, url: response.data.url })
                setValue("audio_url", response.data.key)
                setValue("name", e.target.files[0].name)

                toast({ title: "Upload successfull", description: "Your audio is uploaded successfully", variant: "success" })
            }
        } catch (error) {
            console.log({ error })
        }
    }

    return (
        <>
            <Form {...form}>
                <form className=' p-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField control={form.control} name='voice_id' render={({ field, fieldState }) => (
                        <FormItem>
                            <FormControl>
                                <VoiceSelector voices={voicesList?.data.public} privateVoices={voicesList?.data?.private} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage className='text-xs'>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )} />
                    <div className='mt-3'>
                        <Label>Audio</Label>

                        <FormField control={form.control} name='audio_url' render={({ field, fieldState }) => (
                            <FormItem className='mr-2'>
                                <FormControl>
                                    <div className='flex items-center'>
                                        <Input type='file' accept='audio/*' onChange={handleFileChange} />
                                        <p className='mx-4'>Or</p>
                                        <Dialog open={dialogState.recorder} onOpenChange={(open) => setDialogState(prev => ({ ...prev, recorder: open }))}>
                                            <DialogTrigger>
                                                <div>
                                                    <Button asChild>
                                                        <span>Record</span>
                                                    </Button>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <AudioRecorder onRecordingCompleted={(url: string, key: string) => {
                                                    field.onChange(key)
                                                    setValue("name", `Audio-Recording-${uuid()}`)
                                                    setRecordedAudio({ s3_key: key, url })
                                                    setDialogState(prev => ({ ...prev, recorder: false }))
                                                }} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </FormControl>
                                <FormDescription className='my-4'>
                                    <h1 className='font-medium'>Preview</h1>
                                    {
                                        recordedAudio.url && <audio className='my-2' src={recordedAudio.url} controls />
                                    }

                                </FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )} />
                    </div>
                    <div className="flex mt-4 justify-between items-start">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className='rounded-full'>
                                    <CiSettings size={20} className='mr-2' />
                                    Setting
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" side='bottom' className='w-72 md:w-96 p-4 flex flex-col justify-between' onOpenAutoFocus={(e) => e.preventDefault()}>
                                <div>
                                    <div className="mb-4">
                                        <Label htmlFor='stability'>Stability</Label>
                                        <div className="flex justify-between mt-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        More Variable
                                                    </TooltipTrigger>
                                                    <TooltipContent className='max-w-52 '>
                                                        <p className='text-xs text-semibold text-black'>Increasing Variability can make speech more expressive with output varying between regeneration. it can also lead to instabilities</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        More Stable
                                                    </TooltipTrigger>
                                                    <TooltipContent className='max-w-52 '>
                                                        <p className='text-xs text-semibold text-black'>Increasing stability will make the voice more consistent between regenerations, but it can also make it sound a bit monotone. On longer text fragments, we recommend lowering the value</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormField control={form.control} name='stability' render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Slider className='mt-2' defaultValue={[field.value]} max={100} showTooltip onValueChange={(vals) => field.onChange(vals[0])} />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="mt-4">
                                        <Label htmlFor='similarity'>Similarity</Label>
                                        <div className="flex justify-between mt-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        Low
                                                    </TooltipTrigger>
                                                    <TooltipContent className='max-w-52 '>
                                                        <p className='text-xs text-semibold text-black'>Low values are recommended if background artifacts are present in generated speech</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        High
                                                    </TooltipTrigger>
                                                    <TooltipContent className='max-w-52 '>
                                                        <p className='text-xs text-semibold text-black'>High enhancement boosts overall voice clarity and target speaker similarity. Very high values can cause artifacts, so adjusting this setting to find the optimal value is encouraged.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormField control={form.control} name='similarity_boost' render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Slider className='mt-2' defaultValue={[field.value]} max={100} showTooltip onValueChange={(vals) => field.onChange(vals[0])} />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="mt-4">
                                        <Label htmlFor='style'>Style Exaggeration</Label>
                                        <div className="flex justify-between mt-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        None
                                                    </TooltipTrigger>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className='text-xs'>
                                                        Exaggerated
                                                    </TooltipTrigger>
                                                    <TooltipContent className='max-w-52 '>
                                                        <p className='text-xs text-semibold text-black'>High values are recommended if the style of the speech should be exaggerated compared to the uploaded audio. Higher values can lead to more instability in the generated speech. Setting this to 0.0 will greatly increase generation speed and is the default setting.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Slider className='mt-2' defaultValue={[20]} max={100} showTooltip />
                                    </div>
                                    <div className="mt-2">
                                        <FormField control={form.control} name='use_speaker_boost' render={({ field: { onChange, value } }) => (
                                            <FormItem className='flex'>
                                                <FormControl>
                                                    <Switch className='mt-2' checked={value} onCheckedChange={onChange} />
                                                </FormControl>
                                                <h3 className='text-sm font-medium ml-2'>Speaker boost</h3>
                                            </FormItem>
                                        )} />

                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button type='submit' disabled={isLoading || !form.formState.isValid} loading={{ isLoading, loader: "tailspin", width: 20, height: 20 }} className='w-36'>Generate speech</Button>
                    </div>
                </form>
            </Form>
            {
                generatedSpeech.length ?
                    <div className=" p-4">
                        <div>
                            <h2 className='text-lg font-semibold'>Changed Voices</h2>
                        </div>

                        <div className="mt-5">
                            {
                                generatedSpeech.map(speech => (
                                    <div className="flex shadow-lg px-5 py-4 rounded justify-between mb-3" key={speech.url}>
                                        <div>
                                            <h1 className='font-semibold'>{speech.name}</h1>
                                            <p className='text-xs text-gray-400'>{speech?.voiceName}</p>
                                        </div>
                                        <div className='flex items-start'>
                                            <Dialog>
                                                <DialogTrigger>
                                                    <div className='w-8 h-8 mr-2 cursor-pointer border-2 flex items-center justify-center rounded-full text-xs'>
                                                        <MdPlayArrow size={18} />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <div className="flex justify-center items-center">
                                                        <CustomVideoPlayer url={speech.url} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <div className='w-8 h-8  cursor-pointer bg-primary text-white flex items-center justify-center rounded-full text-xs' onClick={() => downloadFile(speech.url, `voice-changed-${uuid()}`)}>
                                                <MdDownload size={18} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    : null
            }
        </>
    );
};

export default VoiceChanger;
