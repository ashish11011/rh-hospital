import Footer from '@/components/Footer'
import Header from '@/components/header'
import { Navbar } from '@/components/navbar'
import React from 'react'
import PostHogClient from './posthogClient'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PostHogClient />
            <Header />
            <Navbar />
            <div>{children}</div>
            <Footer />
        </>
    )
}

export default Layout;