import { CirclePlay, Pause } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

const CustomVideoPlayer = ({ url, width }: { url: string, width?: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((currentTime / duration) * 100);
        }
    };

    const handleSliderChange = (value: number[]) => {
        if (videoRef.current) {
            const newValue = value[0];
            videoRef.current.currentTime = (newValue / 100) * videoRef.current.duration;
            setProgress(newValue);
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('timeupdate', handleProgress);
            return () => {
                videoElement.removeEventListener('timeupdate', handleProgress);
            };
        }
    }, []);

    return (
        <div className="relative">
            <video  src={url} width={300} controls />

            
        </div>
    );
};

export default CustomVideoPlayer;
