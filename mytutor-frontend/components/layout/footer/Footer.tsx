"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import { FaGlobe } from "react-icons/fa";
import {
  FaFacebook,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaTelegram,
  FaTiktok,
} from "react-icons/fa";

import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import { Language, Languages } from "../../../types/Translation";
import { AppState } from "@/state/store/store";
import { useUserService } from "../../account/auth/UserService";
import useTranslation from "../../../utils/translation";
import { setLanguage } from "@/state/store/slices/userSlices";
import { PartialUser } from "../../../types/UserItem";
import useAuthentication from "../../account/auth/authentication";
import useAuthorization, {
  isVisible,
} from "@/components/account/auth/authorization";
import { languages } from "../../account/profile/ProfileDetail";
import useCategoryService from "@/components/courses/category/CategoryService";
import { Category } from "@/types/Category";
import { SOCIAL_PROFILE_LINKS } from "@/utils/socialMedia";

// Separate component for social media links
const SocialMediaLinks = () => {
  const socialLinks = [
    { url: SOCIAL_PROFILE_LINKS.website, icon: FaLink, key: "website", label: "MyTutor website" },
    { url: SOCIAL_PROFILE_LINKS.facebook, icon: FaFacebook, key: "facebook", label: "MyTutor on Facebook" },
    { url: SOCIAL_PROFILE_LINKS.instagram, icon: FaInstagram, key: "instagram", label: "MyTutor on Instagram" },
    { url: SOCIAL_PROFILE_LINKS.tiktok, icon: FaTiktok, key: "tiktok", label: "MyTutor on TikTok" },
    { url: SOCIAL_PROFILE_LINKS.telegram, icon: FaTelegram, key: "telegram", label: "MyTutor on Telegram" },
    { url: SOCIAL_PROFILE_LINKS.linkedin, icon: FaLinkedin, key: "linkedin", label: "MyTutor on LinkedIn" },
  ];

  return (
    <>
      {socialLinks.map(
        ({ url, icon: Icon, key, label }) =>
          url && (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-custom_orange-300/70 bg-white text-custom_black-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-custom_orange-900 hover:bg-custom_orange-900 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom_orange-900 focus-visible:ring-offset-2"
            >
              <Icon size={18} aria-hidden="true" />
            </a>
          )
      )}
    </>
  );
};

// Separate component for footer services links
const ServicesLinks = ({ categories }: { categories: Category[] }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <li className="mt-[12px]">
        <span className="text-gray-500">Loading...</span>
      </li>
    );
  }

  return (
    <>
      <li className="mt-[12px]">
        <Link href="/tutors" className="hover:text-custom_orange-900 transition-colors">
          Find a tutor
        </Link>
      </li>
      {categories.map((category) => (
        <li className="mt-[12px]" key={category.id}>
          <Link
            href={`/?category=${category.id}#courses`}
            className="hover:text-custom_orange-900 transition-colors"
          >
            {category.category_name}
          </Link>
        </li>
      ))}
      <li className="mt-[12px]">
        <Link href="/#courses" className="hover:text-custom_orange-900 transition-colors">
          Courses
        </Link>
      </li>
    </>
  );
};

// Separate component for quick links
const QuickLinks = () => {
  const authorize = useAuthorization();
  const isLoggedIn = authorize.isLoggedIn();

  return (
    <ul className="pt-1 font-[300]">
      <li className={`mt-[12px] ${isVisible(!isLoggedIn)}`}>
        <Link href="/student_register" className="hover:text-custom_orange-900 transition-colors">
          Sign Up as Student
        </Link>
      </li>
      <li className={`mt-[12px] ${isVisible(!isLoggedIn)}`}>
        <Link href="/tutor_register" className="hover:text-custom_orange-900 transition-colors">
          Sign Up as Tutor
        </Link>
      </li>
      <li className="mt-[12px]">
        <Link href="/privacy-policy" className="hover:text-custom_orange-900 transition-colors">
          Privacy Policy
        </Link>
      </li>
      <li className="mt-[12px]">
        <Link href="/terms-and-conditions" className="hover:text-custom_orange-900 transition-colors">
          Terms &amp; Conditions
        </Link>
      </li>
    </ul>
  );
};

// Main Footer Component
function Footer() {
  const authorize = useAuthorization();
  const { control, register } = useForm<Language>();
  const user = useSelector((state: AppState) => state.user);
  const userService = useUserService();
  const dispatch = useDispatch();
  const { translate } = useTranslation();
  const authentication = useAuthentication();
  const categoryService = useCategoryService();

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: response } = await categoryService.getCategories({
          pinned: true
        });
        setCategories(response.results || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, [categoryService]);

  // Handle language change
  const applyLanguage = async (val: string) => {
    const language = val as Languages;

    // Update local state immediately for better UX
    dispatch(setLanguage(language));

    // Update user preferences if logged in
    if (authentication.isLoggedIn()) {
      try {
        const data: PartialUser = { lang: language };
        const response = await userService.updateUser(user.id, data);

        // Ensure the language is synced with backend
        if (response.data.lang !== language) {
          dispatch(setLanguage(response.data.lang));
        }
      } catch (error) {
        console.error("Failed to update user language:", error);
        // Optionally show a toast notification here
      }
    }
  };

  return (
    <footer className="bg-custom_orange-100">
      <div className="container w-full mx-auto max-md:px-2">
        <div className="relative flex w-full py-8">
          <div className="flex justify-between flex-wrap w-full gap-8">
            {/* Company Info Section */}
            <div className="w-[300px] sm:w-[200px]">
              <div className="grid gap-4">
                <div className="widget-logo">
                  <Link href="/" className="inline-block">
                    <Image
                      src="/images/logo.png"
                      alt="MyTutor Logo"
                      width={80}
                      height={80}
                      priority
                      className="w-20 h-auto"
                    />
                  </Link>
                </div>

                <div>
                  <h4 className="text-custom_black-200 font-medium text-[22px] mb-0">
                    Ethiopia
                  </h4>
                  <p className="text-custom_orange-900 font-[400] text-[15px] mt-[6px]">
                    Bole, Addis Ababa.
                  </p>
                </div>

                <ul className="space-y-3 list-none p-0">
                  <li>
                    <p className="font-light flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-custom_orange-900"
                      />
                      <a
                        href="mailto:contact@mytutor.com.et"
                        className="hover:text-custom_orange-900 transition-colors"
                      >
                        contact@mytutor.com.et
                      </a>
                    </p>
                  </li>
                  <li>
                    <p className="font-light flex items-center gap-2">
                      <FaLink className="text-custom_orange-900" aria-hidden="true" />
                      <a
                        href="https://mytutor.com.et"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-custom_orange-900 transition-colors"
                      >
                        mytutor.com.et
                      </a>
                    </p>
                  </li>
                  <li>
                    <p className="font-light flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faPhoneAlt}
                        className="rotate-90 text-custom_orange-900"
                      />
                      <a
                        href="tel:+251979879486"
                        className="hover:text-custom_orange-900 transition-colors"
                      >
                        (+251) 979 879 486
                      </a>
                    </p>
                  </li>
                </ul>

                {/* Mobile Social Links */}
                <div className="md:hidden">
                  <h5 className="text-custom_black-200 font-medium text-[18px] mb-3">
                    Connect with us
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    <SocialMediaLinks />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <h4 className="text-custom_black-200 font-medium text-[22px] mb-0">
                Services
              </h4>
              {error ? (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              ) : (
                <ul className="pt-1 font-[300] list-none p-0">
                  <ServicesLinks categories={categories} />
                </ul>
              )}
            </div>

            {/* Quick Links Section */}
            <div>
              <h4 className="text-custom_black-200 font-medium text-[22px] mb-0">
                Quick Links
              </h4>
              <QuickLinks />
            </div>

            {/* Language Selector & Desktop Social Links */}
            <div className="mt-10 sm:mt-0">
              <CustomDropdown
                placeholder={translate("languages")}
                data={languages}
                val={user?.lang || Languages.ENG}
                onValueChange={applyLanguage}
                id="id"
                label="language"
                prefix={<FaGlobe />}
                control={control}
                isSearchable={false}
                register={register}
              />

              {/* Desktop Social Links */}
              <div className="max-md:hidden mt-8">
                <h5 className="text-custom_black-200 font-medium text-[18px] mb-3">
                  Connect with us
                </h5>
                <div className="flex flex-wrap gap-3">
                  <SocialMediaLinks />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
