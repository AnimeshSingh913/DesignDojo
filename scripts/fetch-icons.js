const fs = require('fs');
const path = require('path');
const https = require('https');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons', 'hld');

// Download a file from URL
const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => {
          // Add viewBox if missing (sometimes simpleicons SVGs need width/height stripped or styled)
          let svg = data;
          if (!svg.includes('viewBox')) {
            svg = svg.replace('<svg ', '<svg viewBox="0 0 24 24" ');
          }
          // Remove hardcoded fills for simpleicons so we can color them, or keep them if they are official colored logos.
          // For official logos, we might want their original colors, so we'll fetch from colored sources where possible.
          fs.writeFileSync(path.join(ICONS_DIR, filename), svg);
          resolve();
        });
      } else {
        // Fallback for simpleicons if not found elsewhere
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', reject);
  });
};

const SIMPLE_ICONS_BASE = 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons';
const DEV_ICONS_BASE = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';

const customIcons = {
  // Try to get colored SVGs from devicons
  'redis.svg': `${DEV_ICONS_BASE}/redis/redis-original.svg`,
  'kafka.svg': `${DEV_ICONS_BASE}/apachekafka/apachekafka-original.svg`,
  'rabbitmq.svg': `${DEV_ICONS_BASE}/rabbitmq/rabbitmq-original.svg`,
  'docker.svg': `${DEV_ICONS_BASE}/docker/docker-original.svg`,
  'kubernetes.svg': `${DEV_ICONS_BASE}/kubernetes/kubernetes-plain.svg`,
  'postgres.svg': `${DEV_ICONS_BASE}/postgresql/postgresql-original.svg`,
  'mongodb.svg': `${DEV_ICONS_BASE}/mongodb/mongodb-original.svg`,
  'mysql.svg': `${DEV_ICONS_BASE}/mysql/mysql-original.svg`,
  'prometheus.svg': `${DEV_ICONS_BASE}/prometheus/prometheus-original.svg`,
  'grafana.svg': `${DEV_ICONS_BASE}/grafana/grafana-original.svg`,
  // Simpleicons fallbacks (monochrome)
  'elasticsearch.svg': `${SIMPLE_ICONS_BASE}/elasticsearch.svg`,
};

// Lucide icon mapping to generate standard SVG structures
const lucidePaths = {
  'user.svg': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'web-app.svg': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  'mobile-app.svg': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'admin.svg': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'dns.svg': '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'cdn.svg': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  'api-gateway.svg': '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  'reverse-proxy.svg': '<path d="M21 3v6h-6"/><path d="M21 3a9 9 0 0 0-9-9 9.7 9.7 0 0 0-6.74 2.74L3 8"/><path d="M3 21v-6h6"/><path d="M3 21a9 9 0 0 0 9 9 9.7 9.7 0 0 0 6.74-2.74L21 16"/>',
  'load-balancer.svg': '<path d="M16 16v-6a4 4 0 0 0-8 0v6"/><path d="M12 3v3"/><path d="M12 21v-3"/><path d="M21 12h-3"/><path d="M6 12H3"/><circle cx="12" cy="12" r="2"/>',
  'waf.svg': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  'firewall.svg': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'application-server.svg': '<rect width="18" height="20" x="3" y="2" rx="2"/><path d="M7 6h10"/><path d="M7 10h10"/><path d="M7 14h10"/><path d="M7 18h10"/>',
  'microservice.svg': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
  'worker.svg': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'cron-scheduler.svg': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'sql-database.svg': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  'nosql-database.svg': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  'object-storage.svg': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><rect width="4" height="4" x="10" y="10" rx="1"/>',
  'file-storage.svg': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  'queue.svg': '<path d="M3 8h18"/><path d="M3 16h18"/>',
  'event-bus.svg': '<path d="M3 12h18"/><path d="m17 8 4 4-4 4"/><path d="M8 8H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>',
  'cloud.svg': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  'region.svg': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  'authentication.svg': '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  'notification.svg': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'search.svg': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'analytics.svg': '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  'monitoring.svg': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'logging.svg': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
  'payment.svg': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  'email.svg': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'sms.svg': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'third-party-api.svg': '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/>',
  'external-service.svg': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};

const generateLucideSvg = (name, paths) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}">${paths}</svg>`;
};

async function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Download custom colored logos
  for (const [filename, url] of Object.entries(customIcons)) {
    try {
      await downloadFile(url, filename);
      console.log(`Downloaded ${filename}`);
    } catch (e) {
      console.error(e);
    }
  }

  // Generate Lucide SVGs
  for (const [filename, paths] of Object.entries(lucidePaths)) {
    fs.writeFileSync(path.join(ICONS_DIR, filename), generateLucideSvg(filename.replace('.svg', ''), paths));
    console.log(`Generated ${filename}`);
  }
}

main();
