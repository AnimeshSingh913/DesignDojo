import { Question } from '../types';

export const mockQuestions: Question[] = [
  // EASY
  {
    id: 'q-easy-1',
    title: 'Parking Lot',
    difficulty: 'Easy',
    description: 'Design a parking lot system that can accommodate different types of vehicles and pricing strategies.',
    functionalRequirements: [
      'Support multiple floors and parking spots.',
      'Support different vehicle types (Motorcycle, Car, Truck).',
      'Allocate parking spots dynamically based on vehicle type.',
      'Calculate fee upon checkout.'
    ],
    nonFunctionalRequirements: [
      'High concurrency for entry and exit gates.',
      'Low latency for spot assignment.'
    ],
    constraints: [
      'Maximum 10 floors.',
      'Up to 10,000 spots.'
    ],
    hints: [
      'Use the Strategy pattern for pricing calculations.',
      'Consider using an Enum for vehicle types and spot types.'
    ],
    expectedConcepts: ['Inheritance', 'Strategy Pattern', 'Factory Pattern'],
    recommendedDiagramType: 'Class Diagram'
  },
  {
    id: 'q-easy-2',
    title: 'Library Management',
    difficulty: 'Easy',
    description: 'Design a library management system to track books, members, and issuing/returning of books.',
    functionalRequirements: [
      'Members can search for books by title, author, or subject.',
      'Librarian can add/remove books.',
      'Members can issue up to 5 books at a time.',
      'System calculates fine for late returns.'
    ],
    nonFunctionalRequirements: [
      'Data consistency for book availability.',
      'Secure access for librarians.'
    ],
    constraints: [
      'Books have unique ISBNs.',
      'Maximum 5 checkouts per member.'
    ],
    hints: [
      'Track book copies separately from the book definition.',
      'Use State pattern for book copy status (Available, Issued, Lost).'
    ],
    expectedConcepts: ['Aggregation', 'State Pattern'],
    recommendedDiagramType: 'Class Diagram'
  },
  {
    id: 'q-easy-3',
    title: 'ATM',
    difficulty: 'Easy',
    description: 'Design an Automated Teller Machine (ATM) system.',
    functionalRequirements: [
      'User can authenticate using PIN.',
      'User can view balance, deposit cash, and withdraw cash.',
      'System deducts balance accurately.',
      'System handles insufficient funds gracefully.'
    ],
    nonFunctionalRequirements: [
      'ACID compliance for transactions.',
      'High security and fault tolerance.'
    ],
    constraints: [
      'ATM hardware has limited cash capacity.'
    ],
    hints: [
      'State pattern is highly recommended for ATM machine states.',
      'Transaction management is crucial.'
    ],
    expectedConcepts: ['State Pattern', 'Transaction Management'],
    recommendedDiagramType: 'State Diagram'
  },
  {
    id: 'q-easy-4',
    title: 'Elevator System',
    difficulty: 'Easy',
    description: 'Design a smart elevator system for a multi-story building.',
    functionalRequirements: [
      'Handle requests from floors (Up/Down).',
      'Handle requests from inside the elevator.',
      'Optimize elevator movement to minimize wait times.'
    ],
    nonFunctionalRequirements: [
      'Real-time responsiveness.',
      'High availability.'
    ],
    constraints: [
      'Maximum 50 floors.',
      'Maximum 4 elevators.'
    ],
    hints: [
      'Think about dispatching algorithms (e.g. SCAN algorithm).',
      'Use observer pattern for floor request notifications.'
    ],
    expectedConcepts: ['Observer Pattern', 'Algorithm Design'],
    recommendedDiagramType: 'State Diagram'
  },
  {
    id: 'q-easy-5',
    title: 'Snake & Ladder',
    difficulty: 'Easy',
    description: 'Design a classic Snake & Ladder multiplayer board game.',
    functionalRequirements: [
      'Support multiple players (2-4).',
      'Roll a 6-sided die.',
      'Handle snake bites and ladder climbs.',
      'Declare the first player to reach 100 as the winner.'
    ],
    nonFunctionalRequirements: [
      'Extensible board size.',
      'Reusable dice component.'
    ],
    constraints: [
      'Board is exactly 100 cells by default.'
    ],
    hints: [
      'Separate the Game, Board, and Player entities.',
      'A Cell can contain an entity (Snake or Ladder).'
    ],
    expectedConcepts: ['Encapsulation', 'Game Loop'],
    recommendedDiagramType: 'Class Diagram'
  },
  {
    id: 'q-easy-6',
    title: 'Tic Tac Toe',
    difficulty: 'Easy',
    description: 'Design a 3x3 Tic Tac Toe game.',
    functionalRequirements: [
      'Two players can play on a 3x3 grid.',
      'Check for win or draw after every move.',
      'Prevent overwriting existing moves.'
    ],
    nonFunctionalRequirements: [
      'Fast execution.',
      'Clean separation of logic and UI.'
    ],
    constraints: [
      'Grid size is strictly 3x3.'
    ],
    hints: [
      'Use a 2D array or 1D array for the grid.',
      'Keep win-checking logic efficient.'
    ],
    expectedConcepts: ['Matrix Operations', 'Basic OOD'],
    recommendedDiagramType: 'Class Diagram'
  },

  // MEDIUM
  {
    id: 'q-medium-1',
    title: 'Splitwise',
    difficulty: 'Medium',
    description: 'Design an expense sharing application like Splitwise.',
    functionalRequirements: [
      'Users can add expenses and split them (equally, exact, percentages).',
      'Users can view balances with friends.',
      'System simplifies debts automatically.'
    ],
    nonFunctionalRequirements: [
      'High accuracy for financial calculations.',
      'Fast read access for user balances.'
    ],
    constraints: [
      'Splits must sum exactly to the total amount.'
    ],
    hints: [
      'Use Factory pattern for different split strategies.',
      'Graph algorithms are useful for debt simplification.'
    ],
    expectedConcepts: ['Graph Algorithms', 'Factory Pattern', 'Strategy Pattern'],
    recommendedDiagramType: 'Class Diagram'
  },
  {
    id: 'q-medium-2',
    title: 'BookMyShow',
    difficulty: 'Medium',
    description: 'Design a movie ticket booking system.',
    functionalRequirements: [
      'Search for movies by city, language, and genre.',
      'Select seats and book tickets.',
      'Handle concurrent bookings for the same seat.',
      'Process payments.'
    ],
    nonFunctionalRequirements: [
      'High concurrency handling.',
      'Read-heavy system (searching movies).'
    ],
    constraints: [
      'Seats cannot be double-booked.',
      'Lock seats for 5 minutes during checkout.'
    ],
    hints: [
      'Consider optimistic or pessimistic locking for seats.',
      'Separate City, Cinema, Screen, and Show entities.'
    ],
    expectedConcepts: ['Concurrency', 'Database Locking', 'ACID'],
    recommendedDiagramType: 'Sequence Diagram'
  },
  {
    id: 'q-medium-3',
    title: 'Amazon Locker',
    difficulty: 'Medium',
    description: 'Design the Amazon Locker pickup system.',
    functionalRequirements: [
      'Assign an optimal locker size for a package.',
      'Generate a unique access code for the customer.',
      'Customer can pick up using the code.',
      'Handle locker returns.'
    ],
    nonFunctionalRequirements: [
      'High availability.',
      'Secure access codes.'
    ],
    constraints: [
      'Lockers have specific sizes (S, M, L, XL).',
      'Package must fit in the assigned locker.'
    ],
    hints: [
      'Chain of Responsibility for finding locker sizes.',
      'State pattern for locker states (Empty, Booked, Filled).'
    ],
    expectedConcepts: ['State Pattern', 'Chain of Responsibility'],
    recommendedDiagramType: 'State Diagram'
  },
  {
    id: 'q-medium-4',
    title: 'Food Delivery',
    difficulty: 'Medium',
    description: 'Design a food delivery app like Swiggy/Zomato.',
    functionalRequirements: [
      'Users can search restaurants and menus.',
      'Users can place orders.',
      'Delivery partners can accept/reject orders.',
      'Track order status in real-time.'
    ],
    nonFunctionalRequirements: [
      'Geospatial search capabilities.',
      'Event-driven updates for tracking.'
    ],
    constraints: [
      'Real-time tracking accuracy.'
    ],
    hints: [
      'Observer pattern for status updates.',
      'QuadTrees or Geohashing for location searches.'
    ],
    expectedConcepts: ['Observer Pattern', 'Geospatial Algorithms'],
    recommendedDiagramType: 'Sequence Diagram'
  },
  {
    id: 'q-medium-5',
    title: 'Coffee Machine',
    difficulty: 'Medium',
    description: 'Design an automated coffee machine.',
    functionalRequirements: [
      'Dispense different types of coffee (Espresso, Cappuccino, Latte).',
      'Track ingredient inventory (Milk, Water, Beans).',
      'Alert when ingredients are low.'
    ],
    nonFunctionalRequirements: [
      'Extensible for new recipes.',
      'Thread-safe dispensing.'
    ],
    constraints: [
      'Cannot dispense if ingredients are insufficient.'
    ],
    hints: [
      'Decorator pattern for adding condiments (sugar, extra milk).',
      'Singleton for inventory management.'
    ],
    expectedConcepts: ['Decorator Pattern', 'Singleton Pattern'],
    recommendedDiagramType: 'Class Diagram'
  },
  {
    id: 'q-medium-6',
    title: 'Hotel Booking',
    difficulty: 'Medium',
    description: 'Design a hotel room booking system.',
    functionalRequirements: [
      'Search hotels by location and dates.',
      'Book rooms of specific types (Standard, Deluxe).',
      'Handle dynamic pricing based on demand.'
    ],
    nonFunctionalRequirements: [
      'Handle high volume search traffic.',
      'Ensure room availability consistency.'
    ],
    constraints: [
      'Prevent double booking.',
      'Checkout time enforcement.'
    ],
    hints: [
      'Use Strategy pattern for pricing logic.',
      'Implement inventory locking.'
    ],
    expectedConcepts: ['Strategy Pattern', 'Concurrency Control'],
    recommendedDiagramType: 'Sequence Diagram'
  },

  // HARD
  {
    id: 'q-hard-1',
    title: 'WhatsApp',
    difficulty: 'Hard',
    description: 'Design a real-time chat application like WhatsApp.',
    functionalRequirements: [
      '1-on-1 and Group messaging.',
      'Message status (Sent, Delivered, Read).',
      'Online/Offline presence.'
    ],
    nonFunctionalRequirements: [
      'Extremely low latency.',
      'High availability (Partition tolerance).',
      'End-to-end encryption.'
    ],
    constraints: [
      'Billions of messages per day.',
      'Mobile devices with intermittent connectivity.'
    ],
    hints: [
      'WebSockets for real-time delivery.',
      'Message queueing for offline users.'
    ],
    expectedConcepts: ['WebSockets', 'Message Queues', 'CAP Theorem'],
    recommendedDiagramType: 'Deployment Diagram'
  },
  {
    id: 'q-hard-2',
    title: 'Google Docs',
    difficulty: 'Hard',
    description: 'Design a collaborative document editing tool.',
    functionalRequirements: [
      'Multiple users can edit a document simultaneously.',
      'Changes are reflected in real-time.',
      'Document history and revisions.'
    ],
    nonFunctionalRequirements: [
      'Conflict resolution.',
      'Low latency rendering.'
    ],
    constraints: [
      'Network delays may cause out-of-order edits.'
    ],
    hints: [
      'Operational Transformation (OT) or CRDTs are essential here.',
      'Command pattern for undo/redo.'
    ],
    expectedConcepts: ['CRDT / OT', 'Command Pattern'],
    recommendedDiagramType: 'Sequence Diagram'
  },
  {
    id: 'q-hard-3',
    title: 'Uber',
    difficulty: 'Hard',
    description: 'Design a ride-hailing service like Uber.',
    functionalRequirements: [
      'Riders can request rides.',
      'Drivers receive ride requests based on proximity.',
      'Real-time trip tracking and ETA calculation.',
      'Surge pricing computation.'
    ],
    nonFunctionalRequirements: [
      'High throughput for location updates.',
      'Scalable to millions of concurrent active users.'
    ],
    constraints: [
      'Drivers must be matched within seconds.'
    ],
    hints: [
      'Geospatial indexing (Quadtree/S2 Geometry).',
      'Distributed message broker (Kafka) for tracking.'
    ],
    expectedConcepts: ['Geospatial Indexing', 'Event Sourcing'],
    recommendedDiagramType: 'Component Diagram'
  },
  {
    id: 'q-hard-4',
    title: 'Netflix',
    difficulty: 'Hard',
    description: 'Design a global video streaming service.',
    functionalRequirements: [
      'Users can search and watch videos.',
      'Video quality adapts to network bandwidth.',
      'Personalized recommendations.'
    ],
    nonFunctionalRequirements: [
      'Extremely high bandwidth usage.',
      'Global availability and low buffering.'
    ],
    constraints: [
      'Petabytes of video data.',
      'DRM and licensing restrictions.'
    ],
    hints: [
      'CDNs are central to this design.',
      'Adaptive Bitrate Streaming (DASH/HLS).'
    ],
    expectedConcepts: ['CDN Architecture', 'Microservices'],
    recommendedDiagramType: 'Component Diagram'
  },
  {
    id: 'q-hard-5',
    title: 'Spotify',
    difficulty: 'Hard',
    description: 'Design an audio streaming platform.',
    functionalRequirements: [
      'Play songs, create playlists, and share with friends.',
      'Offline playback support.',
      'Social activity feed.'
    ],
    nonFunctionalRequirements: [
      'Continuous playback without stuttering.',
      'Fast search and recommendations.'
    ],
    constraints: [
      'Millions of songs and users.'
    ],
    hints: [
      'Chunking audio files for streaming.',
      'Caching hot songs aggressively.'
    ],
    expectedConcepts: ['Audio Streaming', 'Caching Strategies'],
    recommendedDiagramType: 'Deployment Diagram'
  }
];
