import { DiagramType } from '../types';

export interface ToolDefinition {
  id: string;
  label: string;
  type: 'node' | 'edge';
  icon?: string; // Optional icon identifier
}

// Since HLD usually uses one large canvas, we can group tools by logical categories
export const DIAGRAM_TOOLS_MAP: Record<DiagramType, { nodes: ToolDefinition[], edges: ToolDefinition[] }> = {
  'System Architecture': {
    nodes: [
      { id: 'User', label: 'User', type: 'node' },
      { id: 'WebApp', label: 'Web App', type: 'node' },
      { id: 'MobileApp', label: 'Mobile App', type: 'node' },
      { id: 'Admin', label: 'Admin', type: 'node' },
      
      { id: 'DNS', label: 'DNS', type: 'node' },
      { id: 'CDN', label: 'CDN', type: 'node' },
      { id: 'APIGateway', label: 'API Gateway', type: 'node' },
      { id: 'ReverseProxy', label: 'Reverse Proxy', type: 'node' },
      { id: 'LoadBalancer', label: 'Load Balancer', type: 'node' },
      { id: 'WAF', label: 'WAF', type: 'node' },
      { id: 'Firewall', label: 'Firewall', type: 'node' },
      
      { id: 'AppServer', label: 'Application Server', type: 'node' },
      { id: 'Microservice', label: 'Microservice', type: 'node' },
      { id: 'Worker', label: 'Worker', type: 'node' },
      { id: 'CronScheduler', label: 'Cron Scheduler', type: 'node' },
      
      { id: 'SQLDatabase', label: 'SQL Database', type: 'node' },
      { id: 'PostgreSQL', label: 'PostgreSQL', type: 'node' },
      { id: 'MySQL', label: 'MySQL', type: 'node' },
      { id: 'NoSQLDatabase', label: 'NoSQL Database', type: 'node' },
      { id: 'MongoDB', label: 'MongoDB', type: 'node' },
      { id: 'Redis', label: 'Redis Cache', type: 'node' },
      { id: 'ObjectStorage', label: 'Object Storage', type: 'node' },
      { id: 'FileStorage', label: 'File Storage', type: 'node' },
      
      { id: 'Kafka', label: 'Kafka', type: 'node' },
      { id: 'RabbitMQ', label: 'RabbitMQ', type: 'node' },
      { id: 'Queue', label: 'Queue', type: 'node' },
      { id: 'EventBus', label: 'Event Bus', type: 'node' },
      
      { id: 'Docker', label: 'Docker', type: 'node' },
      { id: 'Kubernetes', label: 'Kubernetes', type: 'node' },
      { id: 'Cloud', label: 'Cloud', type: 'node' },
      { id: 'Region', label: 'Region', type: 'node' },
      
      { id: 'Authentication', label: 'Authentication', type: 'node' },
      { id: 'Notification', label: 'Notification', type: 'node' },
      { id: 'Search', label: 'Search', type: 'node' },
      { id: 'Analytics', label: 'Analytics', type: 'node' },
      { id: 'Monitoring', label: 'Monitoring', type: 'node' },
      { id: 'Logging', label: 'Logging', type: 'node' },
      { id: 'Payment', label: 'Payment', type: 'node' },
      { id: 'Email', label: 'Email', type: 'node' },
      { id: 'SMS', label: 'SMS', type: 'node' },
      
      { id: 'ThirdPartyAPI', label: 'Third Party API', type: 'node' },
      { id: 'ExternalService', label: 'External Service', type: 'node' },
      
      { id: 'GraphQL', label: 'GraphQL', type: 'node' },
      { id: 'gRPC', label: 'gRPC', type: 'node' },
      { id: 'WebSocket', label: 'WebSocket', type: 'node' },
      
      { id: 'Nginx', label: 'Nginx', type: 'node' },
      { id: 'Elasticsearch', label: 'Elasticsearch', type: 'node' },
      { id: 'Prometheus', label: 'Prometheus', type: 'node' },
      { id: 'Grafana', label: 'Grafana', type: 'node' },
      { id: 'Vault', label: 'Vault', type: 'node' },
      { id: 'Consul', label: 'Consul', type: 'node' }
    ],
    edges: [
      { id: 'Connection', label: 'Connection', type: 'edge' },
      { id: 'AsyncConnection', label: 'Async Connection', type: 'edge' },
      { id: 'HTTPConnection', label: 'HTTP / REST', type: 'edge' },
      { id: 'gRPCConnection', label: 'gRPC', type: 'edge' },
      { id: 'WebSocketConnection', label: 'WebSocket', type: 'edge' },
      { id: 'TCPConnection', label: 'TCP / UDP', type: 'edge' }
    ]
  },
  'Microservices': {
    nodes: [
      { id: 'APIGateway', label: 'API Gateway', type: 'node' },
      { id: 'Microservice', label: 'Microservice', type: 'node' },
      { id: 'Authentication', label: 'Auth Service', type: 'node' },
      { id: 'Redis', label: 'Cache', type: 'node' },
      { id: 'SQLDatabase', label: 'Database', type: 'node' },
      { id: 'Kafka', label: 'Message Broker', type: 'node' }
    ],
    edges: [
      { id: 'Connection', label: 'Sync Call', type: 'edge' },
      { id: 'AsyncConnection', label: 'Async Call', type: 'edge' }
    ]
  },
  'Data Pipeline': {
    nodes: [
      { id: 'User', label: 'Data Source', type: 'node' },
      { id: 'Kafka', label: 'Event Stream', type: 'node' },
      { id: 'Worker', label: 'Stream Processor', type: 'node' },
      { id: 'NoSQLDatabase', label: 'Data Lake', type: 'node' },
      { id: 'Analytics', label: 'Analytics Engine', type: 'node' }
    ],
    edges: [
      { id: 'Connection', label: 'Data Flow', type: 'edge' }
    ]
  }
};
