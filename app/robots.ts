import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/my-resumes/",
        "/templates/",
        "/plans/",
        "/extend-resume-limit/",
        "/payment/",
        "/reset-password/",
        "/api/",
      ],
    },
    sitemap: "https://naukri-resume.com/sitemap.xml",
  };
}