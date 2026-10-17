import React from 'react';
import type { Metadata } from 'next';
import { MentorLayout } from '@/components/mentor/MentorLayout';

export const metadata: Metadata = {
  title: 'AI System Design Mentor & Mock Interviewer',
  description:
    'Practice mock system design interviews with an adaptive AI mentor on DesignDojo. Get requirement-gathering drills, adaptive follow-ups, and actionable feedback reports.',
  keywords: [
    'system design interview prep',
    'ai mock interview',
    'system design mentor',
    'system design practice',
    'system design practitioner',
    'designdojo mentor',
  ],
};

export default function MentorPage() {
  return (
    <div className="h-full w-full">
      <MentorLayout />
    </div>
  );
}
