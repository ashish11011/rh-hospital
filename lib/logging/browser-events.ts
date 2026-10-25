// Only these application events may be submitted by browser clients.
export const browserEvents: Record<string, readonly string[]> = {
  "browser/runtime": ["Unhandled browser error", "Unhandled browser rejection"],
  "app/(user)/contact-us/SideForm.tsx": [
    "app/(user)/contact-us/SideForm.tsx: diagnostic",
  ],
  "app/(user)/rh-healthcare-ntai-conference-ric-jaipur-2026/seminarClient.tsx":
    [
      "Validation Errors:",
      "app/(user)/rh-healthcare-ntai-conference-ric-jaipur-2026/seminarClient.tsx: diagnostic",
    ],
  "app/(user)/rh-healthcare-ntai-conference-ric-jaipur-2026/verify/admin/page.tsx":
    ["Browser operation failed", "Failed to start scanner:"],
  "app/admin/generate-certificate/[slug]/ClientForm.tsx": [
    "Certificate email requested",
    "app/admin/generate-certificate/[slug]/ClientForm.tsx: diagnostic",
  ],
  "app/admin/seminar-registration/RegistrationClient.tsx": ["Export failed"],
  "app/admin/workshop-registration/RegistrationClient.tsx": ["Export failed"],
  "components/admin/WorkshopClient.tsx": [
    "components/admin/WorkshopClient.tsx: diagnostic",
  ],
  "components/admin/WorkshopFormDialog.tsx": [
    "components/admin/WorkshopFormDialog.tsx: diagnostic",
  ],
  "components/admin/WorkshopImages.tsx": [
    "Failed to fetch images",
    "Upload error",
  ],
  "components/workshop/takeRegistratoinDialog.tsx": [
    "components/workshop/takeRegistratoinDialog.tsx: diagnostic",
  ],
};
