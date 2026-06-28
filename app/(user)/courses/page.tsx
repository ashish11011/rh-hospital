import CourseList from '@/components/course/CourceList'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { SearchIcon } from 'lucide-react'
import React from 'react'

const page = () => {
    return (
        <div>
            <HeroSection />
            <SearchBar />
            <CourseList />
        </div>
    )
}

export default page

function HeroSection() {
    return <div className=" py-10 bg-gray-50 w-full min-h-72 md:py-10" >
        <div className="container h-full justify-center flex flex-col gap-6 min-h-40">
            <h2 className=" text-2xl md:text-4xl font-semibold">
                Explore Healthcare Courses
            </h2>
            <p className=' max-w-xl text-gray-700 leading-6'>
                Advance your medical career with industry-leading clinical training and certifications, designed by top healthcare professionals.
            </p>

        </div>
    </div>
}

function SearchBar() {
    return (
        <div className=' py-8 container flex flex-col gap-6 justify-between md:flex-row'>
            <InputGroup className=' max-w-xl' >
                <InputGroupInput placeholder='Search courses...' />
                <InputGroupAddon>
                    <SearchIcon />
                </InputGroupAddon>
            </InputGroup>
            <div className=' flex gap-4 items-center'>
                <Badge className='h-7'>All Cources</Badge>
                <Badge className='h-7' variant={'outline'}>Simulators</Badge>
                <Badge className='h-7' variant={'outline'}>Workshops</Badge>
            </div>
        </div>
    )
}

function ListCources() {
    return (
        <div>

        </div>
    )
}