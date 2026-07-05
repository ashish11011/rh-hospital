export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Courses
        </h1>
        <p className="text-slate-500 mt-1">
          Access and resume all your enrolled courses.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
        <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
      </div>
    </div>
  );
}
