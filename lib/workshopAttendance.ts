export const WORKSHOP_ATTENDANCE_MODES = ["online", "offline", "both"] as const;
export const WORKSHOP_REGISTRATION_MODES = ["online", "offline"] as const;

export type WorkshopAttendanceMode = (typeof WORKSHOP_ATTENDANCE_MODES)[number];
export type WorkshopRegistrationMode =
  (typeof WORKSHOP_REGISTRATION_MODES)[number];

export const WORKSHOP_ATTENDANCE_LABELS: Record<
  WorkshopAttendanceMode,
  string
> = {
  online: "Online only",
  offline: "Offline only",
  both: "Both online and offline",
};

export function isWorkshopAttendanceMode(
  value: unknown,
): value is WorkshopAttendanceMode {
  return WORKSHOP_ATTENDANCE_MODES.some((mode) => mode === value);
}

export function getWorkshopAttendanceModes(
  attendanceMode: WorkshopAttendanceMode = "both",
): readonly WorkshopRegistrationMode[] {
  return attendanceMode === "both"
    ? WORKSHOP_REGISTRATION_MODES
    : [attendanceMode];
}

export function isWorkshopRegistrationAllowed(
  attendanceMode: WorkshopAttendanceMode,
  registrationMode: unknown,
): registrationMode is WorkshopRegistrationMode {
  return getWorkshopAttendanceModes(attendanceMode).some(
    (mode) => mode === registrationMode,
  );
}

type WorkshopPricing = {
  attendanceMode: WorkshopAttendanceMode;
  onlinePrice: number;
  offlinePrice: number;
};

export function getWorkshopModePrice(
  workshop: Pick<WorkshopPricing, "onlinePrice" | "offlinePrice">,
  mode: WorkshopRegistrationMode,
) {
  return mode === "online" ? workshop.onlinePrice : workshop.offlinePrice;
}

export function validateWorkshopAttendance(workshop: WorkshopPricing) {
  if (!isWorkshopAttendanceMode(workshop.attendanceMode)) {
    throw new Error("Choose a valid workshop attendance mode.");
  }
  for (const mode of getWorkshopAttendanceModes(workshop.attendanceMode)) {
    const price = getWorkshopModePrice(workshop, mode);
    if (!Number.isInteger(price) || price < 0) {
      throw new Error(
        `Enter a valid non-negative whole-number price for ${mode} attendance.`,
      );
    }
  }
}
