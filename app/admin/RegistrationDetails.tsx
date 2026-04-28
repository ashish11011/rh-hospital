"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RegistrationDetails({ registration }: { registration: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
          <DialogDescription>
            Details for {registration.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Name:</span>
            <span className="col-span-3 text-sm">{registration.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Email:</span>
            <span className="col-span-3 text-sm">{registration.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Mobile:</span>
            <span className="col-span-3 text-sm">{registration.mobileNumber}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Designation:</span>
            <span className="col-span-3 text-sm">{registration.designation}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Institute:</span>
            <span className="col-span-3 text-sm">{registration.instituteName}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">City:</span>
            <span className="col-span-3 text-sm">{registration.city || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Payment Status:</span>
            <span className="col-span-3 text-sm capitalize">{registration.paymentStatus}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold text-sm">Mode of Attendance:</span>
            <span className="col-span-3 text-sm capitalize">{registration.modeOfAttandnace}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
