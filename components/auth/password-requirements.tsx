import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/passwordPolicy";

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="mb-2 text-xs font-medium text-slate-700">
        Your password must contain:
      </p>
      <ul aria-label="Password requirements" className="space-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          const Icon = met ? Check : Circle;
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs ${met ? "text-green-700" : "text-slate-500"}`}
            >
              <Icon aria-hidden="true" className="size-3.5 shrink-0" />
              <span>
                {rule.label}
                <span className="sr-only">
                  {met ? " — met" : " — required"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
