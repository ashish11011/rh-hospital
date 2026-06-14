"use client";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";

export type RadioOption = {
    id: string;
    value: string;
    title: string;
    description?: React.ReactNode;
    disabled?: boolean;
};

export function CustomRadioGroup({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: RadioOption[];
}) {
    return (
        <div>
            <Label className="mb-1">{label}</Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
            >
                {options.map((option) => (
                    <FieldLabel key={option.id} htmlFor={option.id}>
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>{option.title}</FieldTitle>
                                {option.description && (
                                    <FieldDescription>
                                        {option.description}
                                    </FieldDescription>
                                )}
                            </FieldContent>
                            <RadioGroupItem
                                value={option.value}
                                id={option.id}
                                disabled={option.disabled}
                            />
                        </Field>
                    </FieldLabel>
                ))}
            </RadioGroup>
        </div>
    );
}
