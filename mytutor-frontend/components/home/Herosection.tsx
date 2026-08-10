"use client";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPlayCircle,
  FaSearch,
  FaShieldAlt,
  FaSlidersH,
  FaStar,
} from "react-icons/fa";
import { FormEvent, useEffect, useState } from "react";
import { Course } from "../../types/Course";
import { Category } from "../../types/Category";
import { FetchData } from "../../types/FetchData";
import { Course_Status } from "../../types/Enums";
import { Image, Tag } from "antd";
import { Rating } from "../customs/custom-components/Star";
import { isVisible } from "../account/auth/authorization";
import { useSelector } from "react-redux";
import useLoading from "../customs/loading/LoadingHook";
import Loading from "../customs/loading/Loading";
import Link from "next/link";
import NextImage from "next/image";
import useCourseService from "../courses/course/CourseService";
import useCategoryService from "../courses/category/CategoryService";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ExternalAdvert from "../tutors/advert/ExternalAdvert";
import { AppState } from "@/state/store/store";
import { IsWindowUndefined } from "@/utils/func_utils";
import useDebounce from "@/hooks/debounce";
import TextCarousel, { responsive } from "../commons/text-carousel";
import { usePagination } from "../customs/pagination/usePagination";
import { useGetBreakpoint } from "@/hooks/tailwindBreakPoint";
import parentchild from '@/assets/images/parent-child.jpg';

type CourseInstructor = {
  first_name?: string;
  middle_name?: string;
};

const courseFallbackImages = [
  "/images/courses-01.webp",
  "/images/courses-02.webp",
  "/images/courses-03.webp",
];

const formatCoursePrice = (price: number) => {
  if (!Number(price)) return "Free";

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(price))} ETB`;
};

const formatCourseDuration = (duration?: string) => {
  if (!duration) return "Self-paced";

  const parts = duration.split(":").map(Number);
  if (parts.length >= 2 && parts.every(Number.isFinite)) {
    const hours = parts.length === 3 ? parts[0] : 0;
    const minutes = parts.length === 3 ? parts[1] : parts[0];
    const labels = [
      hours > 0 ? `${hours}h` : "",
      minutes > 0 ? `${minutes}m` : "",
    ].filter(Boolean);

    return labels.join(" ") || "Self-paced";
  }

  return duration;
};

const getInstructorNames = (instructors: Course["instructor"]) => {
  const names = ((instructors || []) as CourseInstructor[])
    .map(({ first_name, middle_name }) =>
      [first_name, middle_name].filter(Boolean).join(" ")
    )
    .filter(Boolean);

  return names.join(", ") || "Mytutor instructor";
};

function HeroSection(props: any) {
  const { CheckableTag } = Tag;
  const tailwindBreakPoint = useGetBreakpoint();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<FetchData<Course>>();
  const user = useSelector((state: AppState) => state.user);
  const [categories, setCategories] = useState<FetchData<Category>>();
  const [filterText, setFilterText] = useState("");
  const categoryPagination = usePagination({
    ps: responsive[tailwindBreakPoint]?.items,
  });
  const [pn, setPn] = useState(1);
  const [category_id, setCategoryId] = useState<string | undefined>(
    () => searchParams.get("category") ?? undefined
  );
  const courseService = useCourseService();
  const categoryService = useCategoryService();
  const loading = useLoading();
  const router = useRouter();
  const [categoriesSkeleton, setCategorySkeleton] = useState<Category[]>([]);
  const [slide] = useState(0);
  const [tutorSubject, setTutorSubject] = useState("");
  const [tutorLocation, setTutorLocation] = useState("");
  const { change: searchQuery, handleChange } = useDebounce<string>(
    "",
    500,
    setFilterText
  );
  useEffect(() => {
    if (IsWindowUndefined()) {
      const element = document.getElementById(window?.location.hash ? window?.location.hash.slice(1) : "");
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [router]);

  useEffect(() => {
    const category = searchParams.get("category") ?? undefined;
    setCategoryId((current) => current === category ? current : category);
  }, [searchParams]);

  useEffect(() => {
    setPn(1);
    searchCourses(1);
  }, [filterText, category_id]);

  useEffect(() => {
    searchCategory(undefined, categoryPagination.pageSize * 2);
  }, []);

  const searchCourses = (pn: number) => {
    loading.startLoading();
    courseService
      .getCourses({
        search: filterText,
        ps: 8,
        pn,
        category_id: category_id,
        course_status: Course_Status.PUBLISHED,
      })
      .then(({ data: result }) => {
        if (pn > 1)
          result.results = [...(courses?.results || []), ...result.results];
        setCourses(result);
        loading.stopLoading();
      })
      .catch((error) => loading.stopLoading());
  };

  const searchCategory = (cursor?: string, ps?: number) => {
    categoryService
      .getCategories({
        ps: ps || categoryPagination.pageSize,
        cursor: cursor,
        search: "",
      })
      .then(({ data: res }) => {
        setCategories(res);
        setCategorySkeleton([...categoriesSkeleton, ...res.results]);
      });
  };

  const handleTutorSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = tutorSubject.trim();
    const location = tutorLocation.trim();
    const search = [subject, location].filter(Boolean).join(" ");
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (subject) params.set("subject", subject);
    if (location) params.set("location", location);

    router.push(params.size ? `/tutors?${params.toString()}` : "/tutors");
  };

  return (
    <>
      <div className="bg-custom_orange-100">
        <div className="container mx-auto md:pt-10">
          <ExternalAdvert position="100" />
        </div>
      </div>
      <section className="relative overflow-hidden bg-custom_orange-100 pb-10 pt-4 sm:pb-14 lg:pb-16 lg:pt-8">
        <div aria-hidden="true" className="absolute -left-28 top-16 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-custom_orange-300/25 blur-3xl" />

        <div className="container relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-custom_orange-900">
                Personal tutoring, made simple
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-custom_black-200 sm:text-5xl lg:text-6xl">
                Find the right tutor for the way you learn
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-custom_black-500 sm:text-lg sm:leading-8">
                Search trusted tutors near you, compare subjects, qualifications,
                availability, ratings, and rates, then arrange a lesson that fits
                your goals.
              </p>

              <form
                role="search"
                aria-label="Find a tutor"
                onSubmit={handleTutorSearch}
                className="mt-7 rounded-2xl border border-white/80 bg-white p-3 shadow-[0_16px_45px_rgba(33,40,50,0.12)] sm:p-4"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <label className="relative block">
                    <span className="sr-only">Subject</span>
                    <FaBookOpen aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-custom_orange-900" />
                    <input
                      type="search"
                      value={tutorSubject}
                      onChange={(event) => setTutorSubject(event.target.value)}
                      placeholder="What subject?"
                      autoComplete="off"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-custom_black-200 outline-none transition placeholder:text-gray-400 focus:border-custom_orange-900 focus:ring-4 focus:ring-custom_orange-100"
                    />
                  </label>

                  <label className="relative block">
                    <span className="sr-only">Location</span>
                    <FaMapMarkerAlt aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-custom_orange-900" />
                    <input
                      type="search"
                      value={tutorLocation}
                      onChange={(event) => setTutorLocation(event.target.value)}
                      placeholder="Where do you need a tutor?"
                      autoComplete="address-level2"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-custom_black-200 outline-none transition placeholder:text-gray-400 focus:border-custom_orange-900 focus:ring-4 focus:ring-custom_orange-100"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-custom_orange-900 px-6 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#e85f49] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
                  >
                    <FaSearch aria-hidden="true" />
                    Find a tutor
                  </button>
                </div>
              </form>

              <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/tutor_register"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-custom_orange-900 bg-white/70 px-6 py-3 font-semibold text-custom_orange-900 transition-all hover:-translate-y-0.5 hover:bg-custom_orange-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
                >
                  Become a tutor
                </Link>
                <span className="text-sm text-custom_black-500">
                  Share your expertise and teach on your schedule.
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-white shadow-[0_24px_65px_rgba(33,40,50,0.16)]">
                <NextImage
                  src={parentchild}
                  alt="A tutor helping a young learner with a lesson"
                  priority
                  sizes="(min-width: 1024px) 42vw, (min-width: 640px) 80vw, 100vw"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:left-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-custom_orange-100 text-custom_orange-900">
                  <FaShieldAlt aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-custom_black-200">Trusted tutor profiles</p>
                  <p className="text-xs text-custom_black-500">Compare before you contact</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: FaShieldAlt, title: "Profile details", text: "Review qualifications and experience." },
              { icon: FaStar, title: "Learner ratings", text: "Use feedback to compare tutors." },
              { icon: FaClock, title: "Availability upfront", text: "Find a schedule that works for you." },
              { icon: FaCheckCircle, title: "Tracked sessions", text: "Keep a clear history of completed lessons." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur sm:flex sm:items-start sm:gap-3">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-custom_orange-100 text-custom_orange-900 sm:mb-0 sm:shrink-0">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-custom_black-200">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-custom_black-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative -top-48 my-5" id="courses"></div>
      <section className="w-full py-10 sm:py-14" aria-labelledby="courses-title">
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-custom_orange-900">
                Learn at your pace
              </p>
              <h2
                id="courses-title"
                className="text-3xl font-bold tracking-tight text-custom_black-200 sm:text-4xl"
              >
                Explore all courses
              </h2>
              <p className="mt-3 text-sm leading-6 text-custom_black-500 sm:text-base">
                Discover expert-led courses designed to help you build useful
                skills and reach your learning goals.
              </p>
            </div>

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white px-1 shadow-sm transition focus-within:border-custom_orange-900 focus-within:ring-4 focus-within:ring-custom_orange-100 lg:max-w-md"
            >
              <label htmlFor="course-search" className="sr-only">
                Search courses
              </label>
              <input
                id="course-search"
                type="search"
                value={searchQuery}
                placeholder="Search by course name"
                onChange={(event) => handleChange(event.target.value)}
                className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm text-custom_black-200 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                aria-label="Search courses"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-custom_orange-900 text-white transition hover:bg-[#e85f49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
              >
                <FaSearch aria-hidden="true" />
              </button>
            </form>
          </div>

          <TextCarousel
            slide={slide}
            className="rounded-2xl border border-custom_orange-100 bg-custom_orange-100 px-2 py-3 sm:px-5"
            beforeChange={(e, f) => {
              if (
                e > f.currentSlide &&
                categories?.next &&
                e + f.slidesToShow >= categoriesSkeleton.length
              ) {
                searchCategory(categories.next.cursor);
              }
            }}
          >
            <CheckableTag
              className={`mx-1 flex h-10 cursor-pointer items-center justify-center rounded-xl border px-5 text-center text-sm font-medium transition ${
                !category_id
                  ? "border-custom_orange-900 !bg-custom_orange-900 !text-white"
                  : "border-gray-200 bg-white !text-custom_black-200 hover:!border-custom_orange-900 hover:!text-custom_orange-900"
              }`}
              checked={!category_id}
              onChange={() => setCategoryId(undefined)}
            >
              All courses
            </CheckableTag>
            {categoriesSkeleton.map((tag) => (
              <CheckableTag
                className={`mx-1 flex h-10 cursor-pointer items-center justify-center rounded-xl border px-5 text-center text-sm font-medium transition ${
                  category_id === tag.id
                    ? "border-custom_orange-900 !bg-custom_orange-900 !text-white"
                    : "border-gray-200 bg-white !text-custom_black-200 hover:!border-custom_orange-900 hover:!text-custom_orange-900"
                }`}
                key={tag.id}
                checked={category_id === tag.id}
                onChange={() =>
                  setCategoryId(category_id === tag.id ? undefined : tag.id)
                }
              >
                {tag.category_name}
              </CheckableTag>
            ))}
          </TextCarousel>

          <div className="relative min-h-[260px] pt-8">
            <Loading {...loading} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses?.results?.map((course, index) => {
                const rating = Math.min(5, Math.max(0, Number(course.rating) || 0));
                const fallbackImage =
                  courseFallbackImages[index % courseFallbackImages.length];
                const courseImage =
                  typeof course.course_image === "string" && course.course_image
                    ? course.course_image
                    : fallbackImage;

                return (
                  <article
                    key={course.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_28px_rgba(33,40,50,0.08)] transition duration-300 hover:-translate-y-1 hover:border-custom_orange-300 hover:shadow-[0_16px_36px_rgba(33,40,50,0.13)]"
                  >
                    <Link
                      href={`/course_detail/${course.id}`}
                      className="relative block aspect-[16/10] overflow-hidden bg-custom_orange-100"
                      aria-label={`View ${course.name}`}
                    >
                      <Image
                        preview={false}
                        src={courseImage}
                        fallback={fallbackImage}
                        alt={`${course.name} course`}
                        rootClassName="!block !h-full !w-full"
                        className="!h-full !w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      {course.category_names?.[0] && (
                        <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-custom_black-200 shadow-sm backdrop-blur">
                          {course.category_names[0]}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-custom_black-500">
                        <FaGraduationCap
                          className="shrink-0 text-custom_orange-900"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {getInstructorNames(course.instructor)}
                        </span>
                      </div>

                      <h3 className="min-h-[3rem] text-lg font-bold leading-6 text-custom_black-200">
                        <Link
                          href={`/course_detail/${course.id}`}
                          className="transition group-hover:text-custom_orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900"
                        >
                          {course.name}
                        </Link>
                      </h3>

                      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-gray-100 py-4 text-xs text-custom_black-500">
                        <span className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                          <FaBookOpen
                            className="shrink-0 text-custom_orange-900"
                            aria-hidden="true"
                          />
                          {course.chapters || 0} chapters
                        </span>
                        <span className="flex min-w-0 flex-col items-center gap-1.5 border-x border-gray-100 text-center">
                          <FaPlayCircle
                            className="shrink-0 text-custom_orange-900"
                            aria-hidden="true"
                          />
                          {course.contents || 0} lessons
                        </span>
                        <span className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                          <FaClock
                            className="shrink-0 text-custom_orange-900"
                            aria-hidden="true"
                          />
                          {formatCourseDuration(course.durations)}
                        </span>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-custom_black-700">
                            Course fee
                          </p>
                          <p className="mt-1 truncate text-lg font-bold text-custom_orange-900">
                            {formatCoursePrice(course.course_price)}
                          </p>
                        </div>
                        <div
                          className="flex shrink-0 flex-col items-end gap-1"
                          aria-label={`${rating.toFixed(1)} out of 5 stars`}
                        >
                          <span className="text-sm font-semibold text-custom_black-200">
                            {rating.toFixed(1)}
                          </span>
                          <Rating rating={rating} widthHeight="h-3 w-3" />
                        </div>
                      </div>

                      <Link
                        href={`/course_detail/${course.id}`}
                        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-custom_orange-100 px-4 text-sm font-semibold text-custom_orange-900 transition group-hover:bg-custom_orange-900 group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
                      >
                        View course
                        <FaArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {!loading.loading && courses?.results?.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-custom_orange-100 text-custom_orange-900">
                  <FaSearch aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-custom_black-200">
                  No courses found
                </h3>
                <p className="mt-2 max-w-md text-sm text-custom_black-500">
                  Try a different search term or choose another category.
                </p>
                {(searchQuery || category_id) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("");
                      setCategoryId(undefined);
                    }}
                    className="mt-5 rounded-xl border border-custom_orange-900 px-4 py-2 text-sm font-semibold text-custom_orange-900 transition hover:bg-custom_orange-900 hover:text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            className={`mt-10 text-center ${isVisible(
              courses?.next !== undefined
            )}`}
          >
            {courses?.next && (
              <button
                onClick={() => {
                  const nextPage = pn + 1;
                  setPn(nextPage);
                  searchCourses(nextPage);
                }}
                className="rounded-xl border border-custom_orange-900 bg-white px-6 py-3 text-sm font-semibold text-custom_orange-900 transition hover:bg-custom_orange-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
              >
                Show more courses
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <section className={`w-full px-4 pt-10 lg:pt-20 ${isVisible(!user.is_staff)}`}>
            <div className="relative mb-12 overflow-hidden rounded-3xl bg-custom_orange-100 px-6 py-10 shadow-[0_18px_55px_rgba(33,40,50,0.08)] sm:px-10 lg:px-16 lg:py-14">
              <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-white/60" />
              <div aria-hidden="true" className="absolute -bottom-16 right-1/3 h-32 w-32 rounded-full bg-custom_orange-300/25" />

              <div className="relative z-[1] flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-custom_orange-900 sm:text-base">
                    Learn or teach with MyTutor
                  </p>
                  <h2 className="text-3xl font-bold leading-tight text-custom_black-200 sm:text-4xl lg:text-5xl">
                    Ready to start your learning journey?
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-custom_black-500 sm:text-lg">
                    Join as a student to find the right support, or share your expertise as a trusted tutor.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                  <Link href="/student_register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-custom_orange-900 px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2">
                    Join as a student
                  </Link>
                  <Link href="/tutor_register" className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-custom_orange-900 bg-white px-6 py-3 text-center font-semibold text-custom_orange-900 transition-all hover:-translate-y-0.5 hover:bg-custom_orange-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2">
                    Become a tutor
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <div className="bg-custom_orange-100">
            <div className="container mx-auto ">
              <ExternalAdvert position="101" />
            </div>
          </div>
          <section className="relative overflow-hidden bg-gradient-to-b from-white via-custom_orange-100/30 to-white px-4 py-16 lg:py-24" aria-labelledby="how-it-works-title">
            <div aria-hidden="true" className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-custom_orange-300/15 blur-3xl" />
            <div aria-hidden="true" className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-custom_orange-900/10 blur-3xl" />
            <div className="container relative mx-auto max-w-[1200px]">
              <div className="mx-auto max-w-2xl pb-10 text-center lg:pb-14">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-custom_orange-900">
                  Three simple steps
                </p>
                <h2 id="how-it-works-title" className="text-3xl font-bold leading-tight text-custom_black-200 sm:text-4xl lg:text-5xl">
                  Find. Compare. Book.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-custom_black-500 sm:text-lg">
                  Go from searching to learning with a clear, straightforward process.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                {[
                  {
                    icon: FaSearch,
                    number: "1",
                    title: "Find",
                    text: "Search by subject and location to discover tutors who match your needs.",
                  },
                  {
                    icon: FaSlidersH,
                    number: "2",
                    title: "Compare",
                    text: "Review profiles, qualifications, ratings, availability, and rates side by side.",
                  },
                  {
                    icon: FaCalendarCheck,
                    number: "3",
                    title: "Book",
                    text: "Contact your chosen tutor and arrange a lesson around your schedule.",
                  },
                ].map(({ icon: Icon, number, title, text }, index) => (
                  <div key={title} className="contents">
                    <article className="group relative flex min-h-[245px] flex-col rounded-3xl border border-custom_orange-300/60 bg-white p-7 shadow-[0_12px_36px_rgba(33,40,50,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-custom_orange-900/40 hover:shadow-[0_22px_50px_rgba(33,40,50,0.12)]">
                      <div className="flex items-center justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-custom_orange-100 text-2xl text-custom_orange-900 transition-transform group-hover:scale-105">
                          <Icon aria-hidden="true" />
                        </span>
                        <span className="text-5xl font-bold text-custom_orange-100">{number}</span>
                      </div>
                      <h3 className="mt-7 text-2xl font-bold text-custom_black-200">{title}</h3>
                      <p className="mt-3 text-[15px] leading-7 text-custom_black-500">{text}</p>
                    </article>
                    {index < 2 && (
                      <FaArrowRight aria-hidden="true" className="mx-auto hidden text-xl text-custom_orange-900 lg:block" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center lg:mt-14">
                <Link
                  href="/tutors"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-custom_orange-900 px-7 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#e85f49] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
                >
                  Browse all tutors
                  <FaArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      <div></div>
      <div className="pt-[80px] w-full mt-[-0.3125rem]"></div>
      <div className="bg-custom_orange-100">
        <div className="container mx-auto ">
          <ExternalAdvert position="102" />
        </div>
      </div>
    </>
  );
}

export default HeroSection;
