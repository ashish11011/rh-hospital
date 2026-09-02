// app/invalid-qr/page.tsx

export default function InvalidQRPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
          ⚠️
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Event QR Pass
        </h1>

        <p className="mt-4 font-semibold text-amber-700">
          Present this QR pass at the event entrance.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This pass is unique and should not be shared. Only authorized event
          staff can scan and verify this pass.
        </p>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            If you are not an authorized staff member, please do not scan or
            share this QR code.
          </p>
        </div>
      </div>
    </main>
  );
}
