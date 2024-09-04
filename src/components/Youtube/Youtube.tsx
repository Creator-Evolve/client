import React from 'react'
import { FaHashtag, FaImage, FaTags, FaMagic,FaBookOpen } from 'react-icons/fa'
import { Card } from '../ui/card'
import { MdDescription } from 'react-icons/md';
import Link from 'next/link'
import { MdSubtitles } from 'react-icons/md';

const tools = [
  { icon: FaMagic, name: 'All-in-One Generator', path: '/youtube-optimizer/all-in-one', description: 'Upload video and generate all content' },
  { icon: MdSubtitles, name: 'Subtitle Generator', path: '/generator/subtitle' },
  { icon: FaImage, name: 'Thumbnail Generator', path: '/generator/thumbnail' },
  { icon: FaHashtag, name: 'Hashtag Generator', path: '/generator/hashtag' },
  { icon: FaBookOpen, name: 'Chapters Generator', path: '/generator/chapters' },
  { icon: MdDescription, name: 'Description Generator', path: '/generator/description' },
  { icon: FaTags, name: 'Tags Generator', path: '/generator/tags' },
]

const YoutubeOptimizer = () => {
  return (
    <>
      <div className="mb-10">
        <h1 className="md:text-3xl text-2xl font-bold text-primary">YouTube Optimization Tools</h1>
        <p className="text-gray-500 text-sm font-medium">
          Enhance your YouTube content with our suite of tools: Hashtag Generator, Thumbnail Generator, Chapters Generator, Tags Generator, and Description Generator. Explore features, get started with the user guide, and find support resources to optimize your videos efficiently.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {tools.map((tool, index) => (
          <Link href={tool.path} key={index}>
            <Card className="cursor-pointer w-72 h-20 hover:bg-gray-200 transition duration-300 flex items-center justify-start px-5">
              <tool.icon size={25} />
              <p className='font-medium ml-4'>{tool.name}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

export default YoutubeOptimizer