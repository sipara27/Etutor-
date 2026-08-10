"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPlus,
  FiShield,
  FiStar,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

import { Reviewers } from "../../commons/Reviewers/Reviewers";
import useAuthentication from "../../account/auth/authentication";
import useAvailablityTimeService from "../availabilityTime/AvaliablityService";
import useETutorContractService from "../etutorContract/ETutorContractService";
import { AvailablityTime } from "../../../types/AvailablityItem";
import { ContractStatus, Days } from "../../../types/Enums";
import { LocalStorage } from "../../../utils/localstorage";
import useTutorService from "./ToturService";
import { AvailableTime, Tutor } from "./TutorInfoModel";

type ContractRequestValues = {
  payment_date: string;
  student_subject: string;
  student_level: string;
  student_location: string;
  contract_availabilty_times: AvailableTime[];
};

const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7";

const TutorInfoDetail = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tutorService = useTutorService();
  const availabilityService = useAvailablityTimeService();
  const contractService = useETutorContractService();
  const authentication = useAuthentication();

  const [tutor, setTutor] = useState<Tutor>();
  const [availability, setAvailability] = useState<AvailablityTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const form = useForm<ContractRequestValues>({
    defaultValues: {
      payment_date: "",
      student_subject: "",
      student_level: "",
      student_location: "",
      contract_availabilty_times: [
        { day: 1, start_time: "", end_time: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contract_availabilty_times",
  });

  const loadTutor = async () => {
    if (!params?.id) return;

    setIsLoading(true);
    setLoadError(false);
    try {
      const { data } = await tutorService.getTutor(params.id);
      setTutor(data);
      setAvailability((data.availabilty_times || []) as AvailablityTime[]);

      form.setValue(
        "student_subject",
        data.preferred_subject_names?.join(", ") || "",
      );
      form.setValue(
        "student_level",
        data.preferred_grade_names?.join(", ") || "",
      );

      try {
        const response = await availabilityService.getAvailablityTimes({
          isHome: true,
          user: data.tutor,
        });
        if (response.data.results?.length) {
          setAvailability(response.data.results);
        }
      } catch {
        // The tutor payload already contains a safe availability fallback.
      }
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadTutor();
    // The route id is the only value that should trigger a profile reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const rating = Number(tutor?.average_rate_value || tutor?.rating || 0);
  const reviewCount = Number(tutor?.no_of_review || tutor?.reviews || 0);

  const initials = useMemo(
    () =>
      tutor?.tutor_name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "MT",
    [tutor?.tutor_name],
  );

  const sortedAvailability = useMemo(
    () => [...availability].sort((a, b) => Number(a.day) - Number(b.day)),
    [availability],
  );

  const handleRequestClick = () => {
    if (tutor?.is_contracted) {
      router.push("/portal#my_tutor");
      return;
    }

    if (!authentication.isLoggedIn()) {
      const storage = new LocalStorage();
      storage.setKeyValue("tutorinfopage", window.location.pathname);
      router.push("/login");
      return;
    }

    setShowRequestForm(true);
  };

  const submitRequest: SubmitHandler<ContractRequestValues> = async (values) => {
    if (!tutor) return;

    setRequestError("");
    try {
      await contractService.addETutorContract({
        ...values,
        status: ContractStatus.REQUESTED,
        tutor: tutor.id,
        contract_availabilty_times: values.contract_availabilty_times.map(
          (time) => ({ ...time, day: Number(time.day) }),
        ),
      });
      setRequestSent(true);
      setShowRequestForm(false);
      setTutor({ ...tutor, is_contracted: true });
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      setRequestError(
        typeof details === "string"
          ? details
          : "We could not send your request. Please review the details and try again.",
      );
    }
  };

  if (isLoading) return <TutorDetailSkeleton />;

  if (loadError || !tutor) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="rounded-3xl border border-orange-100 bg-orange-50 px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-custom_orange-700 shadow-sm">
            <FiUser size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tutor profile unavailable
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            This profile may no longer be active, or we could not load it right
            now.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadTutor}
              className="rounded-xl bg-custom_orange-700 px-5 py-3 font-semibold text-white transition hover:bg-[#e95f4b]"
            >
              Try again
            </button>
            <Link
              href="/tutors"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-custom_orange-700 hover:text-custom_orange-700"
            >
              Browse tutors
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[linear-gradient(180deg,#fff7f4_0px,#ffffff_420px)] pb-16">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/tutors"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-custom_orange-700"
        >
          <FiArrowLeft /> Back to all tutors
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_24px_80px_rgba(255,115,92,0.12)]">
          <div className="h-2 bg-gradient-to-r from-custom_orange-700 via-orange-300 to-emerald-400" />
          <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
            <ProfileImage
              image={tutor.profile_picture}
              initials={initials}
              name={tutor.tutor_name}
            />

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  <FiShield /> ID verified
                </span>
                {tutor.is_active !== false && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-custom_orange-700">
                    <span className="h-2 w-2 rounded-full bg-custom_orange-700" />
                    Available
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {tutor.tutor_name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-slate-600">
                <FiMapPin className="text-custom_orange-700" />
                {[tutor.woreda_name, tutor.zone_name, tutor.region_name]
                  .filter(Boolean)
                  .join(", ") || "Ethiopia"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} />
                  <strong className="text-slate-900">{rating.toFixed(1)}</strong>
                  <span className="text-slate-500">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <FiClock className="text-custom_orange-700" />
                  {Number(tutor.total_hour || 0)} hours taught
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 px-6 py-5 text-white lg:min-w-52">
              <p className="text-sm text-slate-300">Lessons from</p>
              <p className="mt-1 text-3xl font-extrabold">
                Br {Number(tutor.hourly_rate || 0).toLocaleString()}
                <span className="text-sm font-normal text-slate-300"> / hour</span>
              </p>
              <button
                type="button"
                onClick={handleRequestClick}
                className="mt-4 w-full rounded-xl bg-custom_orange-700 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e95f4b]"
              >
                {tutor.is_contracted ? "View contract" : "Request this tutor"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-7">
            <section className={cardClass}>
              <SectionHeading
                icon={<FiUser />}
                eyebrow="Meet your tutor"
                title="About"
              />
              <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-slate-600 sm:text-base">
                {tutor.introduction ||
                  `${tutor.tutor_name} is ready to help learners build confidence and make steady progress.`}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tutor.preferred_subject_names?.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-custom_orange-700"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeading
                icon={<FiAward />}
                eyebrow="Background"
                title="Education & experience"
              />

              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <ProfileTimeline
                  icon={<FiBookOpen />}
                  title="Education"
                  emptyText="Education details will be shared during your introduction."
                  items={(tutor.educations || []).map((education) => ({
                    id: education.id,
                    title: education.field_of_study || "Area of study",
                    subtitle:
                      education.school_of_education || "Educational institution",
                    meta: [
                      education.level_of_education_name,
                      education.currently_learning
                        ? `${education.start_date} – Present`
                        : [education.start_date, education.year_of_graduation]
                            .filter(Boolean)
                            .join(" – "),
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  }))}
                />
                <ProfileTimeline
                  icon={<FiBriefcase />}
                  title="Experience"
                  emptyText="Experience details will be shared during your introduction."
                  items={(tutor.experiences || []).map((experience) => ({
                    id: experience.id,
                    title: experience.job_title || "Teaching experience",
                    subtitle: experience.company || "Independent tutor",
                    meta: experience.currently_working
                      ? `${experience.start_date} – Present`
                      : [experience.start_date, experience.end_date]
                          .filter(Boolean)
                          .join(" – "),
                  }))}
                />
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeading
                icon={<FiStar />}
                eyebrow="Student feedback"
                title="Ratings & reviews"
              />
              <div className="mt-5 [&_.tab-pane]:px-0 [&_h3:first-of-type]:sr-only">
                <Reviewers id={params.id} />
              </div>
            </section>
          </div>

          <aside className="space-y-7 lg:sticky lg:top-24">
            {requestSent && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                <FiCheckCircle className="mb-3 text-3xl" />
                <h2 className="text-lg font-bold">Request sent</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  Your tutor request is in the portal. We’ll keep you updated
                  there.
                </p>
                <Link
                  href="/portal#my_tutor"
                  className="mt-4 inline-flex font-bold text-emerald-900 underline underline-offset-4"
                >
                  Open portal
                </Link>
              </div>
            )}

            <section className={cardClass}>
              <SectionHeading
                icon={<FiCalendar />}
                eyebrow="Weekly schedule"
                title="Availability"
                compact
              />
              <div className="mt-5 space-y-3">
                {sortedAvailability.length ? (
                  sortedAvailability.map((time, index) => (
                    <div
                      key={time.id || `${time.day}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <span className="font-semibold text-slate-800">
                        {dayLabel(Number(time.day))}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatTime(time.start_time)} – {formatTime(time.end_time)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center">
                    <FiClock className="mx-auto text-2xl text-custom_orange-700" />
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Ask the tutor about the times that work best for you.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-xl font-bold text-slate-900">
                Ready to start learning?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Send your learning goals and preferred schedule to this tutor.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {["No payment required to request", "Choose a schedule together", "Manage lessons in your portal"].map(
                  (benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FiCheck size={14} />
                      </span>
                      {benefit}
                    </li>
                  ),
                )}
              </ul>
              <button
                type="button"
                onClick={handleRequestClick}
                className="mt-6 w-full rounded-xl bg-custom_orange-700 px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e95f4b]"
              >
                {tutor.is_contracted ? "View contract" : "Request this tutor"}
              </button>
            </section>
          </aside>
        </div>
      </div>

      {showRequestForm && (
        <RequestTutorModal
          fields={fields}
          form={form}
          tutor={tutor}
          requestError={requestError}
          onClose={() => setShowRequestForm(false)}
          onAddTime={() => append({ day: 1, start_time: "", end_time: "" })}
          onRemoveTime={remove}
          onSubmit={form.handleSubmit(submitRequest)}
        />
      )}
    </main>
  );
};

const ProfileImage = ({
  image,
  initials,
  name,
}: {
  image?: string;
  initials: string;
  name: string;
}) => (
  <div className="relative mx-auto h-36 w-36 shrink-0 lg:mx-0 lg:h-44 lg:w-44">
    {image ? (
      // The API owns these URLs, so a regular img keeps local and production media compatible.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={`${name}'s profile`}
        className="h-full w-full rounded-3xl object-cover ring-8 ring-orange-50"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-orange-50 text-4xl font-extrabold text-custom_orange-700 ring-8 ring-orange-50">
        {initials}
      </div>
    )}
    <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white">
      <FiCheck />
    </span>
  </div>
);

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar
        key={star}
        className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
      />
    ))}
  </div>
);

const SectionHeading = ({
  icon,
  eyebrow,
  title,
  compact = false,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  compact?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <span className={`${compact ? "h-10 w-10" : "h-11 w-11"} flex shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-xl text-custom_orange-700`}>
      {icon}
    </span>
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-custom_orange-700">
        {eyebrow}
      </p>
      <h2 className={`${compact ? "text-xl" : "text-2xl"} font-extrabold text-slate-900`}>
        {title}
      </h2>
    </div>
  </div>
);

type TimelineItem = { id: string; title: string; subtitle: string; meta: string };

const ProfileTimeline = ({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ReactNode;
  title: string;
  items: TimelineItem[];
  emptyText: string;
}) => (
  <div>
    <h3 className="flex items-center gap-2 font-bold text-slate-900">
      <span className="text-custom_orange-700">{icon}</span> {title}
    </h3>
    {items.length ? (
      <div className="mt-4 space-y-5 border-l-2 border-orange-100 pl-5">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-custom_orange-700 ring-2 ring-orange-100" />
            <p className="font-bold text-slate-800">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
            {item.meta && <p className="mt-1 text-xs text-slate-400">{item.meta}</p>}
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
        {emptyText}
      </p>
    )}
  </div>
);

const RequestTutorModal = ({
  fields,
  form,
  tutor,
  requestError,
  onClose,
  onAddTime,
  onRemoveTime,
  onSubmit,
}: {
  fields: { id: string }[];
  form: ReturnType<typeof useForm<ContractRequestValues>>;
  tutor: Tutor;
  requestError: string;
  onClose: () => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) => (
  <div
    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
    role="dialog"
    aria-modal="true"
    aria-labelledby="request-tutor-title"
    onMouseDown={(event) => event.target === event.currentTarget && onClose()}
  >
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-custom_orange-700">
            Tutor request
          </p>
          <h2 id="request-tutor-title" className="mt-1 text-2xl font-extrabold text-slate-900">
            Learn with {tutor.tutor_name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tell the tutor what you need and when you are available.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-100 px-3 py-2 text-xl text-slate-600 transition hover:bg-slate-200"
          aria-label="Close request form"
        >
          ×
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Preferred start date" error={form.formState.errors.payment_date?.message}>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
              {...form.register("payment_date", { required: "Choose a preferred start date." })}
            />
          </FormField>
          <FormField label="Learning location" error={form.formState.errors.student_location?.message}>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. Bole, Addis Ababa"
              {...form.register("student_location", { required: "Enter the learning location." })}
            />
          </FormField>
          <FormField label="Subject" error={form.formState.errors.student_subject?.message}>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
              placeholder="What would you like to study?"
              {...form.register("student_subject", { required: "Enter a subject." })}
            />
          </FormField>
          <FormField label="Student level" error={form.formState.errors.student_level?.message}>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. Grade 10"
              {...form.register("student_level", { required: "Enter the student level." })}
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Your availability</h3>
              <p className="text-xs text-slate-500">Add at least one time that works for you.</p>
            </div>
            <button
              type="button"
              onClick={onAddTime}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-custom_orange-700"
            >
              <FiPlus /> Add time
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1.25fr_1fr_1fr_auto] sm:items-center">
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
                  {...form.register(`contract_availabilty_times.${index}.day`, {
                    valueAsNumber: true,
                    required: true,
                  })}
                >
                  {Days.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
                <input
                  type="time"
                  aria-label="Start time"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
                  {...form.register(`contract_availabilty_times.${index}.start_time`, { required: true })}
                />
                <input
                  type="time"
                  aria-label="End time"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-custom_orange-700 focus:ring-2 focus:ring-orange-100"
                  {...form.register(`contract_availabilty_times.${index}.end_time`, { required: true })}
                />
                <button
                  type="button"
                  onClick={() => onRemoveTime(index)}
                  disabled={fields.length === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Remove time"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        {requestError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{requestError}</p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="rounded-xl bg-custom_orange-700 px-6 py-3 font-bold text-white transition hover:bg-[#e95f4b] disabled:cursor-wait disabled:opacity-60"
          >
            {form.formState.isSubmitting ? "Sending request…" : "Send tutor request"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <span className="mt-1.5 block">{children}</span>
    {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
  </label>
);

const TutorDetailSkeleton = () => (
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

const dayLabel = (day: number) => Days.find((item) => item.value === day)?.label || "Flexible";

const formatTime = (value: string | Date) => {
  const time = typeof value === "string" ? value : value.toTimeString();
  const [hourString, minute = "00"] = time.split(":");
  const hour = Number(hourString);
  if (Number.isNaN(hour)) return String(value);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${period}`;
};

export default TutorInfoDetail;
