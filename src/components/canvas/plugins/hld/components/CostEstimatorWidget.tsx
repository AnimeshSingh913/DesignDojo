import React, { useEffect, useState } from 'react';
import { DollarSign, Activity } from 'lucide-react';
import { useHLDWorkspace } from '../context/HLDWorkspaceContext';
import { HLDASTEngine } from '../ast/HLDASTEngine';

interface Props {
  excalidrawAPI: any;
}

export function CostEstimatorWidget({ excalidrawAPI }: Props) {
  const [cost, setCost] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Hardcoded approximate monthly cost (USD) for standard AWS equivalents
  const basePricing: Record<string, number> = {
    'LoadBalancer': 20,
    'APIGateway': 15,
    'CDN': 10,
    'DNS': 5,
    'AppServer': 15,
    'Microservice': 15,
    'Worker': 10,
    'SQLDatabase': 40,
    'PostgreSQL': 40,
    'MySQL': 40,
    'NoSQLDatabase': 35,
    'MongoDB': 35,
    'Redis': 15,
    'Kafka': 50,
    'RabbitMQ': 20,
    'Queue': 10,
    'ObjectStorage': 5,
    'FileStorage': 5,
    'Elasticsearch': 45,
    'Prometheus': 20,
    'Grafana': 10,
    'Authentication': 15,
  };

  useEffect(() => {
    if (!excalidrawAPI) return;

    const calculateCost = () => {
      const elements = excalidrawAPI.getSceneElements();
      const activeElements = elements.filter((el: any) => !el.isDeleted);
      
      if (activeElements.length === 0) {
        setCost(0);
        setItemCount(0);
        return;
      }

      try {
        const ast = HLDASTEngine.parseFromCanvas(activeElements);
        let total = 0;
        let count = 0;

        ast.nodes.forEach(node => {
          if (node.type !== 'User' && node.type !== 'WebApp' && node.type !== 'MobileApp' && node.type !== 'Admin') {
            count++;
            const basePrice = basePricing[node.type] || 5; // Default $5 for unknown backend components
            let multiplier = 1;
            if (node.size === 'medium') multiplier = 2.5;
            if (node.size === 'large') multiplier = 5;
            
            total += (basePrice * multiplier);
          }
        });

        setCost(Math.round(total));
        setItemCount(count);
      } catch (e) {
        console.error("Cost Estimator Error:", e);
      }
    };

    // Calculate immediately
    calculateCost();

    // Listen to changes
    const unsubscribe = excalidrawAPI.onChange(() => {
      calculateCost();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [excalidrawAPI]);

  if (itemCount === 0) return null;

  return (
    <div className="absolute bottom-6 right-6 bg-surface border border-primary/20 rounded-xl shadow-lg p-3 flex flex-col items-center justify-center text-primary-ink z-10 transition-all hover:scale-105 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 mb-1">
        <Activity size={14} className="text-green-600 animate-pulse" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-primary/60">Live Est. Cost</span>
      </div>
      <div className="flex items-center">
        <DollarSign size={20} className="text-green-600" />
        <span className="text-2xl font-heading font-extrabold tracking-tight">{cost}</span>
        <span className="text-sm text-primary/50 ml-1 font-medium">/mo</span>
      </div>
      <div className="text-[10px] text-primary/40 mt-1">{itemCount} Cloud Components</div>
    </div>
  );
}
