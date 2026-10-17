/**
 * Central branding / deployment config.
 * Set NEXT_PUBLIC_SITE_URL in your environment for production deployments.
 */
export const siteConfig = {
  name: 'DesignDojo',
  tagline: 'AI System Design Dojo',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  author: {
    name: 'Animesh Singh',
    // Optional profile links — leave empty to hide them in the footer / structured data.
    github: process.env.NEXT_PUBLIC_AUTHOR_GITHUB || '',
    linkedin: process.env.NEXT_PUBLIC_AUTHOR_LINKEDIN || '',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  },
};
