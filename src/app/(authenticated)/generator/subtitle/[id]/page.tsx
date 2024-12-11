import Create from '@/components/Subtitle/Create'
import React from 'react'

const Page = ({ params }: { params: { id: string } }) => {
    
    return (
        <Create id={params.id} />
    )
}

export default Page