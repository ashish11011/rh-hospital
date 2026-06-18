import CommingSoon from '@/components/CommingSoon'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Certifications | RH Healthcare",
  description: "View our healthcare and medical training certifications.",
  alternates: {
    canonical: '/certifications',
  },
}

export default function Page() {
    return (
        <CommingSoon />
    )
}