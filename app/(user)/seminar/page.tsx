import React, { Suspense } from 'react'
import { SeminarClient } from './seminarClient'

const page = () => {
    return (
        <Suspense>
            <SeminarClient />
        </Suspense>
    )
}

export default page