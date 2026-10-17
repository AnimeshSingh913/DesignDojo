import React from 'react';
import { siteConfig } from '@/lib/site';

export function JsonLd() {
  const author = {
    '@type': 'Person',
    name: siteConfig.author.name,
    ...(siteConfig.author.linkedin ? { url: siteConfig.author.linkedin } : {}),
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DesignDojo',
      alternateName: [
        'DesignDojo AI',
        'DesignDojo System Design',
        'DesignDojo HLD LLD Practice Platform',
      ],
      url: siteConfig.url,
      description:
        'DesignDojo is the AI Copilot for System Design, High-Level Design (HLD) Practice, and Low-Level Design (LLD) Practice.',
      author: {
        ...author,
        sameAs: [siteConfig.author.github, siteConfig.author.linkedin].filter(Boolean),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'DesignDojo — AI System Design Copilot',
      operatingSystem: 'All',
      applicationCategory: 'DeveloperApplication',
      url: siteConfig.url,
      description:
        'AI-powered system design copilot for HLD practice, LLD practice, machine coding, UML class diagrams, and interactive mock interviews.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author,
      featureList: [
        'HLD Practice - High-Level Design Architecture Builder & Review',
        'LLD Practice - Low-Level Design UML Class Diagrams & Machine Coding',
        'System Design Practice & Interactive Mock Interviews',
        'Traffic & Failure Simulations with SPOF Detection',
        'AI Architecture Generator from Natural Language',
        'Terraform & Infrastructure as Code Generation',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DesignDojo',
      url: siteConfig.url,
      logo: `${siteConfig.url}/favicon/web-app-manifest-512x512.png`,
      founder: author,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is DesignDojo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DesignDojo is an AI-powered system design copilot. It helps software engineers master High-Level Design (HLD) and Low-Level Design (LLD) practice, prepare for system design interviews, and simulate real-world scalable architectures.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I practice HLD (High-Level Design) on DesignDojo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On DesignDojo, you can practice HLD by using the interactive architecture canvas, generating architectures with AI, running live traffic and failure simulations, detecting Single Points of Failure (SPOFs), and getting comprehensive AI design reviews.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I practice LLD (Low-Level Design) and Machine Coding on DesignDojo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DesignDojo provides a dedicated LLD practice workspace where you can build UML class diagrams, analyze SOLID principles, get design pattern recommendations, and auto-generate production-ready boilerplate code.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is DesignDojo effective for System Design Interview practice?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! DesignDojo includes an AI Design Mentor that acts as an adaptive interviewer. It guides requirement gathering, asks deep follow-up questions based on your architectural choices, and provides structured feedback reports.',
          },
        },
      ],
    },
  ];

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
