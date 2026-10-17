import React from 'react';
import type { Metadata } from 'next';
import { HLDWorkspaceLayout } from '@/components/canvas/plugins/hld/HLDWorkspaceLayout';

export const metadata: Metadata = {
  title: 'HLD Practice — High-Level System Design & Architecture Review',
  description:
    'Practice High-Level Design (HLD) on DesignDojo. Build scalable microservices architectures, run traffic and failure simulations, detect single points of failure, and get instant AI architecture reviews.',
  keywords: [
    'hld practice',
    'high level design practice',
    'system design practice',
    'system design practitioner',
    'designdojo system design',
    'microservices architecture practice',
    'architecture review ai',
  ],
};

export default function HLDPracticePage() {
  return <HLDWorkspaceLayout />;
}
