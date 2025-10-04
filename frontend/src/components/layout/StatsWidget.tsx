import { useEffect, useState } from 'react';
import { getDatabaseStats } from '@/services/api';
import type { DatabaseStats } from '@/types';
import { Database, FileText, TrendingUp } from 'lucide-react';

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
    <div className="flex items-center gap-4">
      {/* Papers count */}
      <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-sm">
        <FileText className="w-3.5 h-3.5 text-[#00A9CE] group-hover:scale-110 transition-transform" />
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">{stats.total_papers}</span>
          <span className="text-xs text-white/70">papers</span>
        </div>
      </div>

      {/* Vectors count */}
      <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-sm">
        <Database className="w-3.5 h-3.5 text-[#FC3D21] group-hover:scale-110 transition-transform" />
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">{stats.total_vectors.toLocaleString()}</span>
          <span className="text-xs text-white/70">vectors</span>
        </div>
      </div>

      {/* Index fullness */}
      <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-sm">
        <TrendingUp className="w-3.5 h-3.5 text-green-400 group-hover:scale-110 transition-transform" />
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">{(stats.index_fullness * 100).toFixed(1)}%</span>
          <span className="text-xs text-white/70">indexed</span>
        </div>
      </div>
    </div>
  );
}
