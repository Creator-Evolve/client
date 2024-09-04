import { useUploadFileMutation } from '@/redux/api/app';
import React, { useEffect, useState } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { v4 as uuid } from "uuid"
import { Button } from '../ui/button';

interface IProp {
    onRecordingCompleted: (url: string, s3_key: string) => void
}

const AudioRecorder: React.FC<IProp> = ({ onRecordingCompleted }) => {
    // Initialize the recorder controls using the hook
    const recorderControls = useVoiceVisualizer();
    const { recordedBlob, error } = recorderControls;
    const [fileUploadApi] = useUploadFileMutation()
    const [showSubmitBtn, setShowSubmitBtn] = useState(false)

    // Handle the recorded audio blob
    useEffect(() => {
        if (!recordedBlob) return;

        // Auto-upload when recording stops
        setShowSubmitBtn(true)
    }, [recordedBlob]);


    // Handle any errors
    useEffect(() => {
        if (!error) return;

        console.error('Error:', error);
    }, [error]);

    // Function to handle file upload
    const handleUpload = async (blob: Blob) => {
        try {
            // Convert blob to base64 data URL
            const reader = new FileReader();
            const base64data = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Create a unique filename
            const filename = `recording_${uuid()}.mp3`;

            // Create File object
            const file = await fetch(base64data)
                .then(res => res.blob())
                .then(blob => new File([blob], filename, { type: 'audio/mp3' }));

            // Prepare FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload using fileUploadApi
            const response = await fileUploadApi(formData).unwrap();

            onRecordingCompleted(response.data.url, response.data.key)

        } catch (error) {
            console.error('Upload Error:', error);
            alert('Error uploading MP3 file');
        }
    };


    return (
        <div>
            <VoiceVisualizer
                controls={recorderControls}
                speed={1.0} // Visualization speed
                mainBarColor="#ff0000" // Main bar color
                secondaryBarColor="#00ff00" // Secondary bar color
                barWidth={2} // Width of each bar
                gap={1} // Gap between bars
                rounded={1} // Rounded bars
                audioProcessingTextClassName='Uploading'
                isControlPanelShown={true} // Show control panel
                fullscreen={true} // Fullscreen mode
                onlyRecording={false} // Show visualizer even when not recording
                animateCurrentPick={true} // Animate the current pick
                isDefaultUIShown={false} // Hide default UI elements
                defaultAudioWaveIconColor="#ffffff" // Color of audio wave icon
                defaultMicrophoneIconColor="#ffffff" // Color of microphone icon
                isProgressIndicatorShown={true} // Show progress indicator
                isProgressIndicatorTimeShown={true} // Show progress time
                isProgressIndicatorOnHoverShown={false} // Show progress on hover
                isProgressIndicatorTimeOnHoverShown={false} // Show progress time on hover
            />
            {
                recordedBlob && showSubmitBtn ?
                    <div className="flex">
                        <Button onClick={() => handleUpload(recordedBlob)} className='w-full'>Upload</Button>
                    </div> : null
            }
            {/* Optional: Add more UI controls like start/stop buttons if needed */}
        </div>
    );
};

export default AudioRecorder;
