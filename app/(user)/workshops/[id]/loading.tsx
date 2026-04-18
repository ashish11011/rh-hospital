import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function Loading() {
    return (
        <div className=' container space-y-8 py-12'>

            <Skeleton className='h-52 w-full' />
            <div className=' grid grid-cols-1 md:grid-cols-5 gap-4'>
                <Skeleton className='h-52 col-span-1 md:col-span-3 w-full' />
                <Skeleton className='h-52 col-span-1 md:col-span-2 w-full' />
            </div>
        </div>
    )
}

