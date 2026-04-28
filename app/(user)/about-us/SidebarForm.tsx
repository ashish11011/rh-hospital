'use client'

import { useState } from 'react'
import { Home, ChevronRight, User, Mail, Phone, MessageSquare, Award, Target, Eye, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'


const SidebarForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        query: '',
        agreeToTerms: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        alert('Thank you for contacting us! Our health experts will get back to you soon.')
    }


    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-primary mb-2">Speak to Our Health Experts</h3>
                <p className="text-sm text-gray-600 mb-6">Get reliable medical advice anytime, anywhere.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="mb-1">Name</Label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required

                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <Label className="mb-1">Mobile</Label>
                        <Input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required

                            placeholder="Enter mobile number"
                        />
                    </div>

                    <div>
                        <Label className="mb-1">Email ID</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required

                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <Label className="mb-1">Query</Label>
                        <Textarea
                            name="query"
                            value={formData.query}
                            onChange={handleChange}
                            required


                            placeholder="Enter your query"
                        />
                    </div>

                    <div className="flex gap-2 items-start">
                        <Checkbox id="terms-checkbox" name="terms-checkbox" />
                        <Label htmlFor="terms-checkbox">Accept terms and conditions</Label>

                    </div>

                    <Button
                        type="submit"
                        className=' w-full h-10'
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default SidebarForm