import { useEffect, useState } from 'react';
import { getDatabaseStats } from '@/services/api';
import type { DatabaseStats } from '@/types';
import { FileText, Database, TrendingUp } from 'lucide-react';

export default function StatsWidget() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDatabaseStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-6 text-xs text-white/80">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span>{stats.total_papers} papers</span>
      </div>
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4" />
        <span>{stats.total_vectors.toLocaleString()} vectors</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        <span>{(stats.index_fullness * 100).toFixed(1)}% indexed</span>
      </div>
    </div>
  );
}
