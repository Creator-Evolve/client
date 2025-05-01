'use client'
import Thumbnail from '@/components/Thumbnail/Thumbnail'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const Page = () => {
    const searchParams = useSearchParams()
    const page = (searchParams.get("page")) || "1"
    return (
        <Thumbnail page={parseInt(page)} />
    )
}

export default Page