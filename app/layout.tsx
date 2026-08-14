import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Lato } from "next/font/google";
import GoogleAuthProvider from "@/components/providers/GoogleAuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#0456FF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://naukri-resume.com/"),
  title: {
    default: "Naukari Resume | AI Resume Builder & ATS Friendly Templates",
    template: "%s | Naukari Resume",
  },
  description: "Build professional, ATS-optimized resumes in minutes with our AI-powered resume builder. Choose from modern templates and get hired faster.",
  keywords: [
    "AI Resume Builder",
    "ATS Resume Templates",
    "Free Resume Maker",
    "Professional CV Builder",
    "Job Application Resume",
  ],
  authors: [{ name: "Naukari Resume Team" }],
  creator: "Naukari Resume",
  publisher: "Naukari Resume",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://naukri-resume.com/",
    siteName: "Naukari Resume",
    title: "Naukari Resume | AI Resume Builder & ATS Friendly Templates",
    description: "Create ATS-friendly resumes effortlessly. Pick a template, customize with AI, and download your resume to land top interviews.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Naukari Resume AI Builder Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naukari Resume | AI Resume Builder",
    description:
      "Create ATS-friendly resumes effortlessly with AI suggestions and modern templates.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} h-full antialiased`}
    >
      <body className={`${lato.className} min-h-full flex flex-col`}>
        <AuthProvider>
          <GoogleAuthProvider>
            {children}
          </GoogleAuthProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}