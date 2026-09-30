import type { Metadata } from "next";
import Header from "../components/Header";
import HomeBanner from "../components/HomeBanner";
import ImageText from "../components/ImageText";
import Logos from "../components/Logos";
import Steps from "../components/Steps";
import ChooseTemplates from "../components/ChooseTemplates";
import WhyChoose from "../components/WhyChoose";
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
          "priceCurrency": "USD",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1250",
        },
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
              "text": "Naukri Resume is an AI-powered resume builder designed to help job seekers create professional, ATS-friendly resumes in minutes.",
            },
          },
          {
            "@type": "Question",
            "name": "Is Naukri Resume ATS-friendly?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All Naukri Resume templates are optimized for Applicant Tracking Systems (ATS).",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main>
        <HomeBanner />
        <ImageText />
        <Logos />
        <Steps />
        <ChooseTemplates />
        <WhyChoose />
        <TrustedBy />
        <Testimonials />
        <Faq />
        <Cta />
      </main>

      <Footer />
    </>
  );
}