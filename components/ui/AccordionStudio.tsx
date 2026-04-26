import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const items = [
    {
        title: 'What is RH Healthcare Simulation Centre?',
        content: `RH Healthcare Simulation Centre is a training facility in Jaipur focused on simulation-based learning for nursing and healthcare students. It provides a safe environment to practice real-life clinical skills without risk to patients.`
    },
    {
        title: 'Who can join the training programs?',
        content:
            'Our programs are designed for B.Sc. Nursing students (1st to final year), nursing interns, healthcare trainees, and allied health students looking to improve their clinical skills.'
    },
    {
        title: 'What kind of training is provided?',
        content:
            'We offer hands-on training including clinical skill simulations, emergency response training, medication safety, OSCE-based assessments, and certification courses like BLS, ATLS, IPC, and more.'
    },
    {
        title: 'How does simulation-based training help students?',
        content:
            'Simulation training helps students gain practical experience, improve decision-making, build confidence, and reduce errors by practicing in a controlled and realistic environment.'
    },
    {
        title: 'Are the programs aligned with official standards?',
        content:
            'Yes, all our programs are aligned with Indian Nursing Council (INC) guidelines to ensure standardized training, proper skill assessment, and better career opportunities.'
    }
]

const WorkshopFAQ = ({ className }: { className?: string }) => {
    return (
        // <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
        //     {items.map((item, index) => (
        //         <AccordionItem
        //             key={index}
        //             value={`item-${index + 1}`}
        //             className='data-[state=open]:border-amber-600 not-last:data-[state=open]:border-b-2 dark:data-[state=open]:border-amber-400'
        //         >
        //             <AccordionTrigger className='data-[state=open]:text-amber-600 dark:data-[state=open]:text-amber-400 [&[data-state=open]>svg]:text-amber-600 dark:[&[data-state=open]>svg]:text-amber-400'>
        //                 {item.title}
        //             </AccordionTrigger>
        //             <AccordionContent className='text-muted-foreground'>{item.content}</AccordionContent>
        //         </AccordionItem>
        //     ))}
        // </Accordion>
        <Accordion
            type="single"
            collapsible
            defaultValue="shipping"
            className={cn("", className)}
        >
            {
                items.map((item) => {
                    return (
                        <AccordionItem className='data-[state=open]:border-primary' value={item.title}>
                            <AccordionTrigger className=' data-[state=open]:text-primary md:text-lg'>{item.title}</AccordionTrigger>
                            <AccordionContent className=' text-sm md:text-base text-gray-600 h-full'>
                                {item.content}
                            </AccordionContent>
                        </AccordionItem>
                    )
                })
            }
        </Accordion>
    )
}

export default WorkshopFAQ;
