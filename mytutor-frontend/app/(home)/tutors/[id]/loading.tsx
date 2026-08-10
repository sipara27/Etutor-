const TutorDetailLoading = () => (
  <main className="bg-[linear-gradient(180deg,#fff7f4_0px,#ffffff_420px)] pb-16">
    <div className="container mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-6 h-5 w-36 rounded bg-slate-200" />
      <div className="rounded-[2rem] border border-orange-100 bg-white p-8 sm:p-10">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
          <div className="h-40 w-40 rounded-3xl bg-orange-100" />
          <div className="flex-1 space-y-4">
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="h-9 max-w-sm rounded bg-slate-200" />
            <div className="h-5 max-w-xs rounded bg-slate-100" />
          </div>
          <div className="h-32 w-full rounded-2xl bg-slate-200 sm:w-52" />
        </div>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-72 rounded-3xl bg-slate-100" />
        <div className="h-72 rounded-3xl bg-slate-100" />
      </div>
    </div>
  </main>
);

export default TutorDetailLoading;
