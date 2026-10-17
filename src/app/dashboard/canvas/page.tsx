import React from 'react';
import type { Metadata } from 'next';
import ExcalidrawWrapper from '@/components/canvas/ExcalidrawWrapper';
import { STORAGE_KEYS } from '@/lib/storage/canvasPersistence';

export const metadata: Metadata = {
  title: 'Infinite System Design Canvas',
  description:
    'Freeform architecture canvas for software engineers and architects. Draw, design, and share distributed systems diagrams with ease.',
  keywords: [
    'system design canvas',
    'architecture diagram tool',
    'excalidraw system design',
    'system design practice',
  ],
};

import { CanvasPageClient } from './CanvasPageClient';

export default function CanvasPage() {
  return <CanvasPageClient />;
}
