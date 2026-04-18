import Footer from '@/components/Footer'
import Header from '@/components/header'
import { Navbar } from '@/components/navbar'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header />
            <Navbar />
            <div>{children}</div>
            <Footer />
        </>
    )
}

export default Layout;