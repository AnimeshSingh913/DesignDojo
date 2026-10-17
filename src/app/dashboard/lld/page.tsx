import React from 'react';
import type { Metadata } from 'next';
import { LLDWorkspaceLayout } from '@/components/canvas/plugins/lld/LLDWorkspaceLayout';

export const metadata: Metadata = {
  title: 'LLD Practice — Low-Level Design, UML & Machine Coding',
  description:
    'Practice Low-Level Design (LLD) on DesignDojo. Build interactive UML class and sequence diagrams, validate against SOLID principles, get design pattern recommendations, and generate clean code.',
  keywords: [
    'lld practice',
    'low level design practice',
    'machine coding practice',
    'uml class diagram generator',
    'design patterns practice',
    'system design practice',
    'designdojo lld',
  ],
};

export default function LLDPracticePage() {
  return <LLDWorkspaceLayout />;
}
