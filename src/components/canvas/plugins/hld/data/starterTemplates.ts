export interface TemplateNodeDef {
  id: string;
  toolId: string;
  x: number;
  y: number;
}

export interface TemplateEdgeDef {
  source: string;
  target: string;
  isAsync?: boolean;
}

export interface TemplateDef {
  nodes: TemplateNodeDef[];
  edges?: TemplateEdgeDef[];
}

export const starterTemplates: Record<string, TemplateDef> = {
  'default': {
    nodes: [
      { id: 'client', toolId: 'WebApp', x: 100, y: 200 },
      { id: 'api', toolId: 'APIGateway', x: 400, y: 200 },
      { id: 'app', toolId: 'AppServer', x: 700, y: 200 },
      { id: 'db', toolId: 'PostgreSQL', x: 700, y: 350 },
      { id: 'cache', toolId: 'Redis', x: 400, y: 350 }
    ],
    edges: [
      { source: 'client', target: 'api' },
      { source: 'api', target: 'app' },
      { source: 'app', target: 'db' },
      { source: 'app', target: 'cache' }
    ]
  },
  'hld-1': { // Design Instagram
    nodes: [
      { id: 'mobile', toolId: 'MobileApp', x: 100, y: 200 },
      { id: 'cdn', toolId: 'CDN', x: 400, y: 100 },
      { id: 'api', toolId: 'APIGateway', x: 400, y: 300 },
      { id: 'app', toolId: 'Microservice', x: 700, y: 300 },
      { id: 'objStore', toolId: 'ObjectStorage', x: 1000, y: 100 },
      { id: 'db', toolId: 'PostgreSQL', x: 1000, y: 300 }
    ],
    edges: [
      { source: 'mobile', target: 'cdn' },
      { source: 'mobile', target: 'api' },
      { source: 'cdn', target: 'objStore' },
      { source: 'api', target: 'app' },
      { source: 'app', target: 'objStore' },
      { source: 'app', target: 'db' }
    ]
  },
  'hld-2': { // Design WhatsApp
    nodes: [
      { id: 'mobile1', toolId: 'MobileApp', x: 100, y: 150 },
      { id: 'mobile2', toolId: 'MobileApp', x: 100, y: 300 },
      { id: 'ws', toolId: 'Microservice', x: 400, y: 200 },
      { id: 'queue', toolId: 'Kafka', x: 700, y: 200 },
      { id: 'db', toolId: 'NoSQLDatabase', x: 1000, y: 200 }
    ],
    edges: [
      { source: 'mobile1', target: 'ws' },
      { source: 'mobile2', target: 'ws' },
      { source: 'ws', target: 'queue', isAsync: true },
      { source: 'queue', target: 'db', isAsync: true }
    ]
  },
  'hld-3': { // Design URL Shortener
    nodes: [
      { id: 'client', toolId: 'WebApp', x: 100, y: 200 },
      { id: 'api', toolId: 'LoadBalancer', x: 400, y: 200 },
      { id: 'app', toolId: 'AppServer', x: 700, y: 200 },
      { id: 'cache', toolId: 'Redis', x: 1000, y: 100 },
      { id: 'db', toolId: 'SQLDatabase', x: 1000, y: 300 }
    ],
    edges: [
      { source: 'client', target: 'api' },
      { source: 'api', target: 'app' },
      { source: 'app', target: 'cache' },
      { source: 'app', target: 'db' }
    ]
  },
  'hld-4': { // Design Uber
    nodes: [
      { id: 'rider', toolId: 'MobileApp', x: 100, y: 100 },
      { id: 'driver', toolId: 'MobileApp', x: 100, y: 300 },
      { id: 'api', toolId: 'APIGateway', x: 400, y: 200 },
      { id: 'location', toolId: 'Microservice', x: 700, y: 100 },
      { id: 'matching', toolId: 'Microservice', x: 700, y: 300 },
      { id: 'redis', toolId: 'Redis', x: 1000, y: 100 },
      { id: 'db', toolId: 'PostgreSQL', x: 1000, y: 300 }
    ],
    edges: [
      { source: 'rider', target: 'api' },
      { source: 'driver', target: 'api' },
      { source: 'api', target: 'location' },
      { source: 'api', target: 'matching' },
      { source: 'location', target: 'redis' },
      { source: 'matching', target: 'db' },
      { source: 'matching', target: 'redis' }
    ]
  }
};
