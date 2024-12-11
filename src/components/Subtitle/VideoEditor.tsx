import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Text } from 'react-konva';
import Konva from 'konva';
import { FaPlay } from 'react-icons/fa';
import { FaPause } from 'react-icons/fa6';

interface IProps {
    url: string;
    width?: number;
    height?: number;
    autoplay?: boolean;
}

const VideoPlayer: React.FC<IProps> = ({ url, width = 500, height = 300, autoplay = false }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const imageRef = useRef<Konva.Image>(null);

    // Load video metadata and update size
    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        const handleMetadataLoaded = () => {
            setVideoLoaded(true);
            const image = imageRef.current;
            if (image && video) {
                // Update the image size to match provided dimensions or video size
                image.width(width);
                image.height(height);
                layerRef.current?.batchDraw(); // Re-render Konva layer
            }
        };

        video.addEventListener('loadedmetadata', handleMetadataLoaded);

        // Autoplay if enabled
        if (autoplay && video) {
            handlePlay();
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleMetadataLoaded);
        };
    }, [width, height, autoplay]);

    // Handle Konva animation
    useEffect(() => {
        if (!isPlaying || !layerRef.current) return;

        const anim = new Konva.Animation(() => {
            // Only animate to update the video on the canvas
        }, layerRef.current);

        anim.start();

        return () => {
            anim.stop();
        };
    }, [isPlaying]);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className='flex flex-col justify-center items-center'>
            <Stage width={width} height={height} ref={stageRef} className='border relative'>
                <Layer ref={layerRef}>
                    {!videoLoaded && (
                        <Text text="Loading video..." width={width} height={height} align="center" verticalAlign="middle" />
                    )}
                    <Image ref={imageRef} image={videoRef.current as HTMLVideoElement | undefined} width={width} height={height} />
                </Layer>
            </Stage>
            <video
                ref={videoRef}
                style={{ display: 'none' }} // Hide the video element itself, we only need it for the image source
                src={url}
            />

            <div className='flex mt-4'>
                {
                    !isPlaying ?
                        <button onClick={handlePlay} className='rounded-full p-3 bg-black text-white flex justify-center items-center'>
                            <FaPlay size={20} />
                        </button> :
                        <button onClick={handlePause} className='rounded-full p-3 bg-black text-white flex justify-center items-center'>
                            <FaPause size={20} />
                        </button>
                }
            </div>
        </div>
    );
};

export default VideoPlayer;
