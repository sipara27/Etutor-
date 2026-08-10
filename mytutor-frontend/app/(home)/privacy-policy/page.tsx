import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | MyTutor",
  description:
    "Learn how MyTutor collects, uses, shares, and protects personal information.",
};

const sections: LegalSection[] = [
  {
    id: "about-this-policy",
    title: "About this policy",
    paragraphs: [
      "This Privacy Policy explains how MyTutor collects, uses, stores, and shares personal information when you use mytutor.com.et, create an account, find or provide tutoring, enroll in a course, or otherwise interact with our services.",
      "MyTutor operates from Bole, Addis Ababa, Ethiopia. We process personal data in accordance with applicable Ethiopian law, including the Personal Data Protection Proclamation No. 1321/2024.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: [
      "We collect personal information with your knowledge and consent when you create an account, complete a profile or application, request a tutor, enroll in a course, make a payment, contact us, or otherwise choose to provide information. The information depends on how you use MyTutor and may include:",
    ],
    bullets: [
      "Account and contact information, such as your name, username, email address, phone number, language preference, gender, profile image, and biography.",
      "Tutor information, such as education, professional experience, supporting documents, subjects, grades, location, hourly rate, introduction, availability, and application details.",
      "Learning information, such as course enrollments, progress, quiz answers, reviews, ratings, and course activity.",
      "Tutoring and transaction information, such as tutor requests, contracts, lesson schedules, attendance, student subject and level, lesson location, fees, bank references, tax or receipt details, and uploaded payment receipts.",
      "Communications and support information that you send to us, including feedback and messages.",
      "Technical and security information needed to operate the service, including authentication tokens, request logs, device or browser information, and language or session preferences stored in your browser.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    bullets: [
      "Create, authenticate, secure, and administer accounts.",
      "Match students with tutors and display relevant tutor or course information.",
      "Manage tutor applications, bookings, contracts, attendance, course access, progress, reviews, and support requests.",
      "Process and verify payments and receipts, maintain financial records, and prevent fraud or misuse.",
      "Communicate about accounts, services, transactions, safety, and important policy updates.",
      "Improve the reliability, accessibility, performance, and content of MyTutor.",
      "Comply with legal duties, enforce our Terms & Conditions, and protect users, MyTutor, and the public.",
    ],
  },
  {
    id: "legal-bases",
    title: "Your consent",
    paragraphs: [
      "Consent is MyTutor’s primary basis for collecting and processing your personal information. We ask you to take a clear affirmative action before you submit personal information, and we use it only for the purposes explained at the time of collection and in this policy. Consent must be freely given, specific, informed, and unambiguous; we do not treat silence or inactivity as consent.",
      "You may refuse to provide optional information or withdraw consent at any time by contacting us. Withdrawal does not affect processing already carried out with valid consent. If information is necessary to create an account, deliver a course, arrange tutoring, verify a payment, or provide another service you requested, withdrawing consent may mean we can no longer provide that part of the service.",
      "In limited circumstances, we may process or retain information without consent where Ethiopian law requires or expressly permits it, including compliance with legal, tax, accounting, fraud-prevention, dispute-resolution, or lawful authority requirements. We will limit that processing to what the applicable requirement permits.",
    ],
  },
  {
    id: "sharing-information",
    title: "How we share information",
    paragraphs: [
      "We do not sell personal information. We may share only what is reasonably necessary with:",
    ],
    bullets: [
      "Students, tutors, and instructors when needed for matching, course delivery, scheduling, contracting, or lessons. Public tutor profiles may display professional and service-related information.",
      "Technology, hosting, communications, storage, professional, or financial service providers working for MyTutor under appropriate obligations.",
      "Banks or other parties involved in verifying a payment or transaction where applicable.",
      "Courts, regulators, law-enforcement bodies, or other authorities when disclosure is required or permitted by law.",
      "A successor or transaction partner in a merger, financing, reorganization, or transfer of all or part of MyTutor, subject to applicable safeguards.",
    ],
  },
  {
    id: "retention-security",
    title: "Retention and security",
    paragraphs: [
      "We keep personal information only for as long as reasonably necessary for the purposes described in this policy, including to provide services, maintain transaction and educational records, resolve disputes, prevent abuse, and meet legal, tax, accounting, or reporting duties. Retention periods vary according to the type of record and applicable requirements.",
      "We use administrative and technical safeguards intended to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. No internet service is completely secure, so users should use a strong password, protect account credentials, and notify us promptly of suspected unauthorized access.",
    ],
  },
  {
    id: "your-rights",
    title: "Your privacy rights",
    paragraphs: [
      "Subject to applicable law and any lawful exceptions, you may ask to be informed about our processing, access your personal data, correct inaccurate or incomplete data, request deletion, object to or request restriction of certain processing, withdraw consent at any time, or receive other remedies provided by law. Withdrawing consent is as straightforward as giving it. We may need to verify your identity before completing a request.",
      "Send requests to contact@mytutor.com.et. You may also submit a complaint to the Ethiopian Communications Authority, which serves as Ethiopia’s personal data protection authority.",
    ],
  },
  {
    id: "children",
    title: "Children and guardians",
    paragraphs: [
      "Tutoring may involve children. A parent or lawful guardian should create, authorize, or supervise an account and tutoring arrangement for a child who cannot legally consent for themselves. Guardians should provide only information necessary for matching and lesson delivery. We may ask for evidence of guardian authority or remove information where appropriate.",
    ],
  },
  {
    id: "international-processing",
    title: "Data location and transfers",
    paragraphs: [
      "MyTutor and its service providers may process information using systems in different locations. Where personal data is stored or transferred, we apply the localization, authorization, contractual, security, and other safeguards required by Ethiopian law.",
    ],
  },
  {
    id: "policy-changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy when our services, practices, or legal obligations change. We will publish the revised version on this page and update the effective date. Where a change materially affects your rights, we will provide additional notice when reasonably required.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Your information, clearly explained"
      title="Privacy Policy"
      description="This policy describes what information MyTutor handles, why we use it, and the choices and rights available to you."
      effectiveDate="9 August 2026"
      sections={sections}
    />
  );
}
