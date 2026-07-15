import { SidebarAdmin } from '@/components/admin/SidebarAdmin'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { Metadata } from 'next'
import { requireAdmin } from '@/lib/adminAuth'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}
const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireAdmin("blog");

    return (
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
