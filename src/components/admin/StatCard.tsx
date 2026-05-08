import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, delta, trend = 'neutral', delay = 0 }: Props) {
  const trendColor =
    trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card glossy-overlay p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {delta && <p className={`text-xs mt-2 ${trendColor}`}>{delta}</p>}
        </div>
        <div className="p-3 bg-primary/10 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
