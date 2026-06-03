"use client";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { sourceOfRegistraion } from "@/const/workshopRegistration";
import { Label } from "../ui/label";



export function SourceOfRegistraion({
    // priceOnline,
    // priceOffline,
    value,
    onChange,
}: {
    // priceOnline: number;
    // priceOffline: number;
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <>
            <Label>Source *</Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
            >

                {
                    sourceOfRegistraion.map((source) => {
                        const Icon = source.icon
                        return (
                            <FieldLabel key={source.value} htmlFor={source.value}>
                                <Field orientation="horizontal">
                                    <FieldContent className=" flex-row flex gap-3 items-center">
                                        <FieldDescription>
                                            <Icon />
                                        </FieldDescription>
                                        <FieldTitle className=" capitalize">{source.value}</FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem value={source.value} id={source.value} />
                                </Field>
                            </FieldLabel>
                        )
                    })
                }
            </RadioGroup>
        </>
    );
}