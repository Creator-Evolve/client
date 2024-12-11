import Create from '@/components/Thumbnail/Create'
import React from 'react'

const Page = () => {
    return (
        <div className="">
            <h1 className="md:text-3xl text-2xl font-bold text-primary">Thumbnail Creator</h1>
            <p className="text-gray-500 text-sm font-medium">
                Create eye-catching thumbnails to boost your YouTube video's click-through rate. Choose from a variety of templates or generate custom images with AI-driven design suggestions. Customize your thumbnails with text, images, and branding elements to make your content stand out.
            </p>

            <Create />
        </div>
    )
}

export default Page