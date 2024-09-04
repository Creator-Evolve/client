import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaImage } from 'react-icons/fa';
import { useHotkeys } from 'react-hotkeys-hook';

interface IProp {
    handleAddImage: (imageUrl: string) => void
    handleDeleteElement: () => void
}

const ImageOptions: React.FC<IProp> = ({ handleAddImage, handleDeleteElement }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            handleAddImage(URL.createObjectURL(selectedFile))
            // Handle the selected file here
        }
    };

    useHotkeys("delete", () => handleDeleteElement())

    return (
        <div className="flex">
            <Button onClick={handleButtonClick}>
                <FaImage className="mr-2" size={20} />
                Add Image
            </Button>
            <Input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageOptions;
