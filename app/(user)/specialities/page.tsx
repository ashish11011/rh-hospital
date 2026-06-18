import CommingSoon from "@/components/CommingSoon";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Specialities | RH Healthcare",
  description: "Explore the various healthcare specialities and training programs at RH Healthcare.",
  alternates: {
    canonical: '/specialities',
  },
}

export default function Page() {
    return (
        <CommingSoon />
    )
}