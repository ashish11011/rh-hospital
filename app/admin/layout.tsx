import { SidebarAdmin } from '@/components/admin/SidebarAdmin'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import React from 'react'
const LINKS = [
    {
        name: "Dashboard",
        href: "/admin",
        icon: ""
    },
    {
        name: "Workshop",
        href: "/admin/workshop",
        icon: ""

    }
]


const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        // <div className=' container  py-10'>
        //     <div className=" space-x-4">
        //         {
        //             LINKS.map((link) => (
        //                 <Link className=' underline' key={link.name} href={link.href}>{link.name}</Link>
        //             ))
        //         }
        //     </div>
        //     <div className="my-8">
        //         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        //         <p className="text-gray-500 mt-2">Manage all your workshop listings here.</p>
        //     </div>
        //     {children}
        // </div>
        <SidebarProvider>
            <SidebarAdmin />
            <main className=' w-full'>
                <SidebarTrigger />
                <div className=' w-full p-4'>{children}</div>
            </main>
        </SidebarProvider>
    )
}

export default Layout;