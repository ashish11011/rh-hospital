export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "One special character (e.g. !@#$%)",
    test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
  },
] as const;

export function getPasswordError(password: string): string | null {
  return PASSWORD_RULES.every((rule) => rule.test(password))
    ? null
    : "Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character.";
}
