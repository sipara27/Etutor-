import Link from "next/link";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export default function LegalPage({
  eyebrow,
  title,
  description,
  effectiveDate,
  sections,
}: LegalPageProps) {
  return (
    <main className="bg-white text-custom_black-200">
      <header className="relative overflow-hidden border-b border-custom_orange-100 bg-custom_orange-100">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[42px] border-white/60"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-custom_orange-300/20"
        />
        <div className="container relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-custom_orange-900 transition hover:text-[#d94f39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to MyTutor
          </Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-custom_orange-900">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-custom_black-500 sm:text-lg">
            {description}
          </p>
          <p className="mt-6 text-sm font-medium text-custom_black-500">
            Effective date: {effectiveDate}
          </p>
        </div>
      </header>

      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav
            aria-label={`${title} sections`}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-custom_black-500">
              On this page
            </p>
            <ol className="space-y-1.5">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-sm leading-5 text-custom_black-500 transition hover:bg-white hover:text-custom_orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          {sections.map((section, index) => (
            <section
              id={section.id}
              key={section.id}
              className={`scroll-mt-28 ${index ? "border-t border-gray-100 pt-9" : ""} pb-9`}
            >
              <h2 className="text-2xl font-bold tracking-tight text-custom_black-200">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-[15px] leading-7 text-custom_black-500 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-3 pl-5 text-[15px] leading-7 text-custom_black-500 sm:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc pl-1 marker:text-custom_orange-900">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="rounded-2xl border border-custom_orange-300/70 bg-custom_orange-100 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-custom_orange-900 shadow-sm">
                <FaEnvelope aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Questions about this document?</h2>
                <p className="mt-2 text-sm leading-6 text-custom_black-500">
                  Contact MyTutor at Bole, Addis Ababa, Ethiopia, or email us at{" "}
                  <a
                    href="mailto:contact@mytutor.com.et"
                    className="font-semibold text-custom_orange-900 underline decoration-custom_orange-300 underline-offset-4"
                  >
                    contact@mytutor.com.et
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
