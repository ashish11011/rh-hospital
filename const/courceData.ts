import {
    HeartPulse,
    Pill,
    Stethoscope,
    Brain,
    Activity,
    Syringe,
} from "lucide-react";

export const courses = [
    {
        id: 1,
        title: "Advanced ECG Interpretation",
        category: "Critical Care",
        image:
            "https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg",
        description:
            "Master complex cardiac rhythms and electrophysiology for emergency and critical care.",
        instructor: "Dr. Sarah Mitchell",
        designation: "Cardiology Specialist",
        duration: "12 Hours",
        level: "Advanced",
        certificate: true,
        icon: HeartPulse,
        color: "bg-blue-600",
    },
    {
        id: 2,
        title: "Emergency Nursing Care",
        category: "Nursing",
        image:
            "https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg",
        description:
            "Develop clinical decision-making skills and procedural competency.",
        instructor: "Marcus Thorne, RN",
        designation: "Lead Instructor",
        duration: "24 Hours",
        level: "Intermediate",
        certificate: true,
        icon: Stethoscope,
        color: "bg-green-600",
    },
    {
        id: 3,
        title: "Clinical Pharmacology",
        category: "Pharmacology",
        image:
            "https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg",
        description:
            "Comprehensive guide to drug mechanisms, interactions and patient safety.",
        instructor: "Dr. James Chen",
        designation: "Pharma Researcher",
        duration: "18 Hours",
        level: "Intermediate",
        certificate: true,
        icon: Pill,
        color: "bg-slate-600",
    },
    {
        id: 4,
        title: "Advanced Airway Management",
        category: "Critical Care",
        image:
            "https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg",
        description:
            "Learn airway assessment, intubation techniques and emergency response.",
        instructor: "Dr. David Cooper",
        designation: "Emergency Physician",
        duration: "16 Hours",
        level: "Advanced",
        certificate: true,
        icon: Activity,
        color: "bg-red-600",
    },
    {
        id: 5,
        title: "Neurological Assessment",
        category: "Neurology",
        image:
            "https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg",
        description:
            "Understand neurological examinations and patient assessment protocols.",
        instructor: "Dr. Emily Ross",
        designation: "Neurologist",
        duration: "15 Hours",
        level: "Beginner",
        certificate: true,
        icon: Brain,
        color: "bg-purple-600",
    }
];