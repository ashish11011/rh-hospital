type ContactExportRow = {
  id: string;
  name: string;
  email: string | null;
  mobileNumber: string | null;
  message: string | null;
  formSource: string | null;
  createdAt: Date | null;
};

function csvCell(value: string | null) {
  const text = value ?? "";
  // Keep user-supplied values and phone numbers as text in spreadsheet apps.
  const safeText =
    /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export function contactEnquiriesCsv(rows: ContactExportRow[]) {
  const header = [
    "ID",
    "Name",
    "Email",
    "Mobile number",
    "Message",
    "Source",
    "Created at (UTC)",
  ];
  return (
    "\uFEFF" +
    [
      header.map(csvCell).join(","),
      ...rows.map((row) =>
        [
          row.id,
          row.name,
          row.email,
          row.mobileNumber,
          row.message,
          row.formSource,
          row.createdAt?.toISOString() ?? "",
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\r\n")
  );
}
