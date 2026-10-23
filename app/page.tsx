import type { Metadata } from "next";
import Header from "../components/Header";
import HomeBanner from "../components/HomeBanner";
import ImageText from "../components/ImageText";
import Logos from "../components/Logos";
import Steps from "../components/Steps";
import ChooseTemplates from "../components/ChooseTemplates";
import WhyChoose from "../components/WhyChoose";
import ChooseCovers from "../components/ChooseCovers";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import Faq from "../components/Faq";
import Cta from "../components/Cta";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "AI Resume Builder | ATS-Friendly Resume Maker – Naukri Resume",
  description: "Create a professional, ATS-friendly resume with our AI resume builder. Choose modern templates, improve your CV with AI, customize your resume, and download it easily.",
  alternates: {
    canonical: "https://naukri-resume.com/",
  }
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://naukri-resume.com/#website",
        "name": "Naukri Resume",
        "url": "https://naukri-resume.com/",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://naukri-resume.com/#software",
        "name": "Naukri Resume AI Builder",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://naukri-resume.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Naukri Resume?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Naukri Resume is an AI-powered resume builder designed to help job seekers create professional, ATS-friendly resumes in minutes. Choose from modern templates, customize your content, preview your resume in real time, and download it in PDF format with a premium plan.",
            },
          },
          {
            "@type": "Question",
            "name": "Is Naukri Resume ATS-friendly?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All Naukri Resume templates are optimized for Applicant Tracking Systems (ATS). Our layouts use clean formatting, readable fonts, and proper section structures to improve compatibility with most recruiters' ATS software. You can also use our ATS Score Checker to identify areas for improvement before applying.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I download my resume for free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can create, edit, and preview your resume for free. Downloading your resume in PDF format requires an active Premium plan. Premium also includes ATS Score checking, AI suggestions, premium templates, and other advanced features.",
            },
          },
          {
            "@type": "Question",
            "name": "Is my data safe with Naukri Resume?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Your privacy and security are important to us. Your resume data is stored securely using encrypted connections, and we never sell or share your personal information with third parties. You remain in full control of your resumes and account at all times.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Header />

      <main>
        <HomeBanner />
        <ImageText />
        <Logos />
        <Steps />
        <ChooseTemplates />
        <WhyChoose />
        <ChooseCovers />
        <TrustedBy />
        <Testimonials />
        <Faq />
        <Cta />
      </main>

      <Footer />
    </>
  );
}