import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/templates/',
        '/payment/',
        '/reset-password/',
      ],
    },
    sitemap: 'https://naukri-resume.com/sitemap.xml',
  };
}