import { Question } from '../types';

export const mockQuestions: Question[] = [
  {
    id: 'hld-1',
    title: 'Design Instagram',
    difficulty: 'Hard',
    description: 'Design a photo-sharing service like Instagram.',
    functionalRequirements: [
      'Users can upload, download, and view photos.',
      'Users can search for other users or photos.',
      'Users can follow other users.',
      'Generate a news feed consisting of top photos of all the people the user follows.'
    ],
    nonFunctionalRequirements: [
      'High availability.',
      'Acceptable latency for News Feed generation (200ms).',
      'System should be highly reliable (uploaded photos should not be lost).'
    ],
    constraints: [
      'Read heavy system (100:1 read/write ratio).',
      '500M total users, 1M active daily.',
      '2M new photos every day.'
    ],
    hints: [
      'Separate read and write services to scale independently.',
      'Use Object Storage (S3) for photos and CDN for fast delivery.',
      'Pre-generate News Feed for active users and store in cache.'
    ],
    expectedConcepts: ['Object Storage', 'CDN', 'Load Balancer', 'Cache', 'Async Workers'],
    recommendedDiagramType: 'System Architecture'
  },
  {
    id: 'hld-2',
    title: 'Design WhatsApp',
    difficulty: 'Hard',
    description: 'Design a global instant messaging service like WhatsApp.',
    functionalRequirements: [
      '1-on-1 chatting between users.',
      'Group chatting.',
      'Sent/Delivered/Read receipts.',
      'Online/Offline status.'
    ],
    nonFunctionalRequirements: [
      'Real-time delivery with lowest possible latency.',
      'High consistency (messages should be ordered).',
      'High availability.'
    ],
    constraints: [
      '2 Billion users.',
      '50 Billion messages per day.'
    ],
    hints: [
      'Use WebSockets for real-time bi-directional communication.',
      'Use a NoSQL database for fast message ingestion.',
      'Consider a message queue for buffering spikes.'
    ],
    expectedConcepts: ['WebSockets', 'NoSQL', 'Message Queue', 'Microservices'],
    recommendedDiagramType: 'System Architecture'
  },
  {
    id: 'hld-3',
    title: 'Design URL Shortener',
    difficulty: 'Medium',
    description: 'Design a URL shortener service like TinyURL.',
    functionalRequirements: [
      'Given a URL, generate a shorter alias.',
      'When users access the short link, redirect them to the original URL.',
      'Links can optionally expire.'
    ],
    nonFunctionalRequirements: [
      'High availability.',
      'Low latency redirection.',
      'URL redirection should be fast and non-guessable.'
    ],
    constraints: [
      '100M new URLs created per month.',
      '1B redirections per month.',
      '10 years retention.'
    ],
    hints: [
      'Use Base62 encoding for generating short hashes.',
      'Consider an offline key generation service (KGS).',
      'Use heavily caching for reads.'
    ],
    expectedConcepts: ['Key Generation Service', 'Base62', 'Cache', 'Relational DB'],
    recommendedDiagramType: 'System Architecture'
  },
  {
    id: 'hld-4',
    title: 'Design Uber',
    difficulty: 'Hard',
    description: 'Design a ride-sharing service like Uber.',
    functionalRequirements: [
      'Riders can request a ride.',
      'Drivers can accept rides.',
      'Riders can see nearby drivers.',
      'Real-time location tracking.'
    ],
    nonFunctionalRequirements: [
      'Low latency for location updates.',
      'High availability and partition tolerance.',
      'Consistency for ride matching.'
    ],
    constraints: [
      '10M active riders, 1M active drivers.',
      'Location updates every 3 seconds.'
    ],
    hints: [
      'Use QuadTrees or Geohashes for spatial indexing.',
      'Use WebSockets for real-time tracking.',
      'Decouple dispatch and matching services.'
    ],
    expectedConcepts: ['QuadTree/Geohash', 'WebSockets', 'Microservices', 'Redis'],
    recommendedDiagramType: 'System Architecture'
  }
];
