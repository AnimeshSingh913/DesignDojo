import { generateId, createRectangle, createText, createImage } from '../utils/elementGenerator';
import { ToolDefinition } from '../toolbar/DiagramTools';

const ICON_MAP: Record<string, string> = {
  'User': 'user.svg',
  'WebApp': 'web-app.svg',
  'MobileApp': 'mobile-app.svg',
  'Admin': 'admin.svg',
  'DNS': 'dns.svg',
  'CDN': 'cdn.svg',
  'APIGateway': 'api-gateway.svg',
  'ReverseProxy': 'reverse-proxy.svg',
  'LoadBalancer': 'load-balancer.svg',
  'WAF': 'waf.svg',
  'Firewall': 'firewall.svg',
  'AppServer': 'application-server.svg',
  'Microservice': 'microservice.svg',
  'Worker': 'worker.svg',
  'CronScheduler': 'cron-scheduler.svg',
  'SQLDatabase': 'sql-database.svg',
  'PostgreSQL': 'postgres.svg',
  'MySQL': 'mysql.svg',
  'NoSQLDatabase': 'nosql-database.svg',
  'MongoDB': 'mongodb.svg',
  'Redis': 'redis.svg',
  'ObjectStorage': 'object-storage.svg',
  'FileStorage': 'file-storage.svg',
  'Kafka': 'kafka.svg',
  'RabbitMQ': 'rabbitmq.svg',
  'Queue': 'queue.svg',
  'EventBus': 'event-bus.svg',
  'Docker': 'docker.svg',
  'Kubernetes': 'kubernetes.svg',
  'Cloud': 'cloud.svg',
  'Region': 'region.svg',
  'Authentication': 'authentication.svg',
  'Notification': 'notification.svg',
  'Search': 'search.svg',
  'Analytics': 'analytics.svg',
  'Monitoring': 'monitoring.svg',
  'Logging': 'logging.svg',
  'Payment': 'payment.svg',
  'Email': 'email.svg',
  'SMS': 'sms.svg',
  'ThirdPartyAPI': 'third-party-api.svg',
  'ExternalService': 'external-service.svg',
  'GraphQL': 'graphql.svg',
  'gRPC': 'grpc.svg',
  'WebSocket': 'websocket.svg',
  'Nginx': 'nginx.svg',
  'Elasticsearch': 'elasticsearch.svg',
  'Prometheus': 'prometheus.svg',
  'Grafana': 'grafana.svg',
  'Vault': 'vault.svg',
  'Consul': 'consul.svg'
};

const CATEGORY_COLORS: Record<string, { bg: string, border: string, text: string }> = {
  'Clients': { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
  'Networking': { bg: '#faf5ff', border: '#a855f7', text: '#581c87' },
  'Compute': { bg: '#f0fdf4', border: '#22c55e', text: '#14532d' },
  'Storage': { bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
  'Messaging': { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' },
  'Infrastructure': { bg: '#f8fafc', border: '#64748b', text: '#0f172a' },
  'Services': { bg: '#eef2ff', border: '#6366f1', text: '#312e81' },
  'External': { bg: '#f9fafb', border: '#9ca3af', text: '#111827' }
};

const getCategoryByTool = (id: string): string => {
  if (['User', 'WebApp', 'MobileApp', 'Admin'].includes(id)) return 'Clients';
  if (['DNS', 'CDN', 'APIGateway', 'ReverseProxy', 'LoadBalancer', 'WAF', 'Firewall', 'GraphQL', 'gRPC', 'WebSocket', 'Nginx', 'Consul'].includes(id)) return 'Networking';
  if (['AppServer', 'Microservice', 'Worker', 'CronScheduler'].includes(id)) return 'Compute';
  if (['SQLDatabase', 'PostgreSQL', 'MySQL', 'NoSQLDatabase', 'MongoDB', 'Redis', 'ObjectStorage', 'FileStorage', 'Elasticsearch'].includes(id)) return 'Storage';
  if (['Kafka', 'RabbitMQ', 'Queue', 'EventBus'].includes(id)) return 'Messaging';
  if (['Docker', 'Kubernetes', 'Cloud', 'Region', 'Vault'].includes(id)) return 'Infrastructure';
  if (['Authentication', 'Notification', 'Search', 'Analytics', 'Monitoring', 'Logging', 'Payment', 'Email', 'SMS', 'Prometheus', 'Grafana'].includes(id)) return 'Services';
  return 'External';
};

// Cache to prevent refetching
const svgCache = new Map<string, string>();

async function fetchSvgBase64(filename: string): Promise<string | null> {
  if (!filename) return null;
  if (svgCache.has(filename)) return svgCache.get(filename)!;
  try {
    const res = await fetch(`/icons/hld/${filename}`);
    if (!res.ok) return null;
    const svgText = await res.text();
    // Base64 encode the SVG string safely
    const base64 = btoa(unescape(encodeURIComponent(svgText)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    svgCache.set(filename, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error("Failed to load SVG", err);
    return null;
  }
}


export async function generateHLDNode(x: number, y: number, tool: ToolDefinition): Promise<{ elements: any[], file?: any }> {
  const groupId = generateId();
  const width = 220;
  const height = 72; // Taller for potential wrapped text
  const elements = [];
  let file = null;
  
  const customData = { type: 'node', id: tool.id, label: tool.label, size: 'small' };
  const category = getCategoryByTool(tool.id);
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['External'];

  // 1. Soft Modern Shadow Element
  elements.push(createRectangle(x, y + 4, width, height, {
    groupIds: [groupId],
    backgroundColor: '#0f172a15', // very subtle modern shadow
    strokeColor: 'transparent',
    fillStyle: 'solid',
    roughness: 0,
    strokeWidth: 0,
    roundness: { type: 2 },
    customData
  }));

  const mainBoxId = generateId();
  const textId = generateId();

  // 2. Main Box
  elements.push(createRectangle(x, y, width, height, { 
    id: mainBoxId,
    groupIds: [groupId],
    backgroundColor: colors.bg,
    strokeColor: colors.border,
    fillStyle: "solid",
    roughness: 0,
    strokeWidth: 1.5,
    roundness: { type: 2 },
    boundElements: [{ type: 'text', id: textId }],
    customData
  }));

  // 3. Icon (Image) - Size 32, perfectly centered vertically
  const filename = ICON_MAP[tool.id];
  if (filename) {
    const dataUrl = await fetchSvgBase64(filename);
    if (dataUrl) {
      const fileId = generateId();
      file = {
        id: fileId,
        dataURL: dataUrl,
        mimeType: "image/svg+xml",
        created: Date.now()
      };
      
      const iconSize = 32;
      elements.push(createImage(x + 16, y + (height - iconSize) / 2, iconSize, iconSize, fileId, {
        groupIds: [groupId],
        customData
      }));
    }
  }

  // 4. Text (Helvetica, left aligned next to icon, bound to main box container)
  const hasIcon = !!file;
  const textX = hasIcon ? x + 60 : x + 20;
  const textY = y + 24; // Centered for single line text
  
  elements.push(createText(textX, textY, tool.label, {
    id: textId,
    groupIds: [groupId],
    fontSize: 16,
    fontFamily: 2, // 2 = Helvetica (clean, professional)
    textAlign: "left",
    verticalAlign: "middle",
    strokeColor: colors.text,
    containerId: mainBoxId,
    autoResize: true,
    customData
  }));

  return { elements, file };
}
