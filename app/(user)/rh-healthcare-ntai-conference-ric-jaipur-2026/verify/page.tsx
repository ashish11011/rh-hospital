// app/registration-verified/page.tsx

export default function RegistrationVerifiedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-5">
      <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl sm:p-12">
        {/* Animated tick */}
        <div className="mx-auto mb-7 flex size-24 items-center justify-center rounded-full bg-emerald-100">
          <svg
            viewBox="0 0 52 52"
            className="size-16"
            aria-label="Registration verified"
          >
            <circle
              cx="26"
              cy="26"
              r="23"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              className="verification-circle"
            />

            <path
              fill="none"
              stroke="#10b981"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
              d="M15 27l7 7 15-17"
              className="verification-tick"
            />
          </svg>
        </div>

        <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-emerald-600 uppercase">
          Registration Verified
        </p>

        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          You’re Successfully Registered!
        </h1>

        <p className="mt-4 text-base leading-7 text-gray-600">
          Your registration has been confirmed. You are now a participant in
        </p>

        <div className="mt-7 rounded-2xl bg-blue-50 px-5 py-6">
          <h2 className="text-2xl font-extrabold text-blue-950">
            GLOBAL NURSING SUMMIT 2026
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Organized by <strong>RH Healthcare Pvt. Ltd.</strong>
            <br />
            in collaboration with <strong>NTAI</strong>
          </p>
        </div>
      </div>

      <style>{`
        .verification-circle {
          stroke-dasharray: 145;
          stroke-dashoffset: 145;
          animation: draw-circle 0.7s ease-out forwards;
        }

        .verification-tick {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw-tick 0.5s ease-out 0.65s forwards;
        }

        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-tick {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}
