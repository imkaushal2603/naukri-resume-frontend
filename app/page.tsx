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
  title: "AI Resume Builder & ATS-Optimized Templates",
  description: "Create a job-ready, ATS-friendly resume in minutes with Naukari Resume. AI writing assistance, recruiter-approved templates, and instant download.",
  alternates: {
    canonical: "https://naukri-resume.com/",
  }
};

export default function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Naukari Resume",
    url: "https://naukri-resume.com/",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Naukari Resume AI Builder",
    operatingSystem: "All",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1250",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Naukari Resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Naukari Resume is an AI-powered resume builder designed to help job seekers create professional, ATS-friendly resumes in minutes.",
        },
      },
      {
        "@type": "Question",
        name: "Is Naukari Resume ATS-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All Naukari Resume templates are optimized for Applicant Tracking Systems (ATS).",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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