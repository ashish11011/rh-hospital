import Footer from '@/components/Footer'
import Header from '@/components/header'
import { Navbar } from '@/components/navbar'
import React from 'react'
import { auth } from '@/auth'
import PostHogClient from './posthogClient'

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();
    return (
        <>
            <PostHogClient />
            <Header />
            <Navbar session={session} />
            <div>{children}</div>
            <Footer />
        </>
    )
}

export default Layout;