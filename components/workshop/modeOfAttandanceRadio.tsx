"use client";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ModeOfAttendanceRadio({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <RadioGroup
            value={value}
            onValueChange={onChange}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
            <FieldLabel htmlFor="online-mode">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Online</FieldTitle>
                        <FieldDescription>
                            Attend remotely via internet.
                        </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="online" id="online-mode" />
                </Field>
            </FieldLabel>

            <FieldLabel htmlFor="offline-mode">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Offline</FieldTitle>
                        <FieldDescription>
                            Attend physically at location.
                        </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="offline" id="offline-mode" />
                </Field>
            </FieldLabel>
        </RadioGroup>
    );
}