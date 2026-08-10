import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | MyTutor",
  description:
    "The terms governing access to MyTutor tutoring and course services.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    paragraphs: [
      "These Terms & Conditions govern your access to and use of mytutor.com.et and MyTutor’s tutoring, course, matching, account, and related services. By creating an account, purchasing or providing a service, or otherwise using MyTutor, you agree to these terms and our Privacy Policy.",
      "If you do not agree, do not use the service. If you use MyTutor for an organization or another person, you confirm that you have authority to accept these terms for them.",
    ],
  },
  {
    id: "eligibility-accounts",
    title: "Eligibility and accounts",
    bullets: [
      "Provide accurate, current, and complete information and keep it updated.",
      "Keep your password and account credentials confidential and tell us promptly about suspected unauthorized use.",
      "Use your own account and do not impersonate another person or misrepresent qualifications, identity, age, authority, or experience.",
      "A parent or lawful guardian must authorize and supervise use by a child who does not have legal capacity to accept these terms.",
      "You are responsible for activity performed through your account unless applicable law provides otherwise.",
    ],
  },
  {
    id: "platform-role",
    title: "MyTutor’s role",
    paragraphs: [
      "MyTutor provides tools for discovering tutors, arranging tutoring, administering tutoring contracts, and accessing educational courses. Unless a specific written agreement states otherwise, tutors provide tutoring services independently and are responsible for how they deliver those services.",
      "We may review tutor applications, documents, profiles, or activity, but a listing or approval is not a guarantee of identity, qualifications, suitability, availability, safety, or learning outcomes. Students and guardians should make their own informed assessment before beginning lessons.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "Student, guardian, and tutor responsibilities",
    bullets: [
      "Treat other users respectfully and communicate truthfully and professionally.",
      "Agree on the subject, level, location, schedule, price, cancellation expectations, and safeguarding arrangements before lessons begin.",
      "Tutors must provide services with reasonable skill and care, maintain accurate credentials and availability, and comply with professional, safeguarding, tax, and licensing duties that apply to them.",
      "Students and guardians must provide a safe, appropriate learning environment and necessary supervision for minors.",
      "Attend scheduled lessons on time and promptly communicate changes or safety concerns.",
    ],
  },
  {
    id: "courses-content",
    title: "Courses and learning content",
    paragraphs: [
      "Course descriptions, prices, instructors, availability, and included materials are shown on the relevant course page. Purchasing or enrolling grants a limited, personal, non-transferable right to access that course for its stated availability period, subject to these terms.",
      "Course materials are for personal learning. You may not copy, record, republish, resell, share account access to, or commercially exploit course content unless MyTutor or the rights holder gives written permission. MyTutor does not guarantee a particular grade, certification, employment result, or other outcome.",
    ],
  },
  {
    id: "payments-refunds",
    title: "Payments, fees, and refunds",
    paragraphs: [
      "Prices and fees are displayed in Ethiopian birr unless stated otherwise. You must follow the payment instructions shown for the relevant course or tutoring arrangement and provide accurate payment references or receipts. Access or payment status may remain pending while a payment is verified.",
      "Refunds, credits, cancellations, rescheduling, discounts, and additional charges are determined by the terms shown at purchase, the applicable tutoring contract, and mandatory law. Contact us promptly if you believe a charge or payment status is incorrect. Nothing in these terms removes a non-waivable consumer right.",
    ],
  },
  {
    id: "prohibited-conduct",
    title: "Prohibited conduct",
    bullets: [
      "Use MyTutor for unlawful, fraudulent, abusive, discriminatory, threatening, exploitative, or unsafe activity.",
      "Harass users, solicit unnecessary sensitive information, or place a child at risk.",
      "Upload malware, interfere with security, scrape the service, probe systems, or attempt unauthorized access.",
      "Submit false reviews, fraudulent receipts, misleading credentials, infringing content, or information you do not have permission to use.",
      "Circumvent platform controls, fees, access restrictions, or enforcement measures.",
    ],
  },
  {
    id: "user-content",
    title: "Profiles, reviews, and uploaded content",
    paragraphs: [
      "You retain ownership of content you submit. You give MyTutor a non-exclusive, worldwide, royalty-free license to host, reproduce, format, display, and use that content only as needed to operate, secure, promote, and improve the service. This license ends when the content is deleted, except for retained backups, transaction records, or uses required by law.",
      "You confirm that your content is accurate where required, does not violate another person’s rights, and may lawfully be provided to us. We may remove or restrict content that violates these terms or creates legal, safety, or integrity concerns.",
    ],
  },
  {
    id: "intellectual-property",
    title: "MyTutor intellectual property",
    paragraphs: [
      "The MyTutor service, branding, design, software, and content supplied by MyTutor or its licensors are protected by applicable intellectual-property laws. Except for the limited right to use the service under these terms, no rights are transferred to you. Feedback may be used by MyTutor without restriction or payment, provided it does not identify you publicly without permission.",
    ],
  },
  {
    id: "availability-liability",
    title: "Availability, disclaimers, and liability",
    paragraphs: [
      "We work to keep MyTutor reliable and secure, but the service may occasionally be interrupted, changed, or unavailable. Educational information is general and does not replace advice from a school, regulator, or qualified professional.",
      "To the fullest extent permitted by law, MyTutor is not responsible for indirect, incidental, or consequential loss, or for conduct and services provided independently by users. MyTutor remains responsible where liability cannot lawfully be excluded or limited, including any mandatory consumer protections.",
    ],
  },
  {
    id: "suspension-termination",
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using MyTutor at any time and may request account closure. We may warn, restrict, suspend, or terminate access where we reasonably believe these terms were violated, payment is overdue, information is fraudulent, or action is necessary to protect users, the service, or comply with law. Provisions that by their nature should survive termination will remain effective.",
    ],
  },
  {
    id: "law-disputes",
    title: "Governing law and disputes",
    paragraphs: [
      "These terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Please contact us first so we can try to resolve a concern fairly. If a dispute cannot be resolved informally, it may be submitted to the courts or other competent bodies in Ethiopia, subject to any mandatory rights or procedures that apply.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    paragraphs: [
      "We may revise these terms to reflect changes to MyTutor, business practices, or legal requirements. The revised terms will be posted here with a new effective date. We will provide additional notice of material changes where reasonably required. Continued use after updated terms take effect means you accept them, unless applicable law requires another form of consent.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Rules for using MyTutor"
      title="Terms & Conditions"
      description="These terms explain the responsibilities of MyTutor, students, guardians, tutors, instructors, and other users of the platform."
      effectiveDate="9 August 2026"
      sections={sections}
    />
  );
}
