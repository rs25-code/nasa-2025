import { useEffect, useState } from 'react';
import { getTrends } from '@/services/api';
import type { Persona, TrendsData } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, TrendingUp, Calendar, Dna, Sparkles, 
  BarChart3, Activity, Network, ArrowUp, ArrowDown, Minus 
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

interface TrendsViewProps {
  currentPersona: Persona;
}

const COLORS = ['#0B3D91', '#00A9CE', '#FC3D21', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#3F51B5'];

export default function TrendsView({ currentPersona }: TrendsViewProps) {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrends();
        setTrendsData(data);
      } catch (err) {
        setError('Failed to load trends data.');
        console.error('Trends error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrends();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-8">
              <Skeleton className="h-80 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!trendsData) return null;

  const yearData = Object.entries(trendsData.research_by_year || {})
    .map(([year, papers]) => ({ year, papers }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const organismData = Object.entries(trendsData.top_organisms || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topicData = Object.entries(trendsData.top_topics || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const getStatusIcon = (status: string) => {
    if (status === 'rising') return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (status === 'declining') return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-[#0B3D91] to-[#1a5cc4] rounded-2xl shadow-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Advanced Research Trends</h2>
          <p className="text-gray-600 text-lg mt-1">Deep insights into space biology research patterns</p>
        </div>
      </div>

      {trendsData.temporal_analysis && (
        <Card className="p-6 bg-gradient-to-br from-[#0B3D91]/5 to-[#00A9CE]/5 border-2 border-[#0B3D91]/20">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-[#0B3D91] mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Research Velocity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-[#0B3D91]">
                    {trendsData.temporal_analysis.growth_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <Badge className={
                    trendsData.temporal_analysis.trend === 'accelerating' 
                      ? 'bg-green-500' 
                      : trendsData.temporal_analysis.trend === 'declining' 
                      ? 'bg-red-500' 
                      : 'bg-blue-500'
                  }>
                    {trendsData.temporal_analysis.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Year</p>
                  <p className="text-2xl font-bold text-[#0B3D91]">
                    {trendsData.temporal_analysis.peak_year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Papers</p>
                  <p className="text-2xl font-bold text-[#0B3D91]">
                    {trendsData.temporal_analysis.peak_papers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {trendsData.emerging_areas && trendsData.emerging_areas.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Emerging Research Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendsData.emerging_areas.map((area, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800">{area.topic}</p>
                      <Badge className="bg-emerald-500">
                        +{area.growth_rate}%
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Recent: {area.recent_papers}</span>
                      <span>Total: {area.total_papers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {trendsData.organism_trends_by_year && trendsData.organism_trends_by_year.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Dna className="w-6 h-6 text-[#0B3D91]" />
            <h3 className="text-xl font-bold text-gray-800">Organism Research Velocity</h3>
          </div>
          <div className="space-y-4">
            {trendsData.organism_trends_by_year.slice(0, 8).map((org, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(org.status)}
                    <span className="font-semibold">{org.organism}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <Badge variant="outline">
                      {org.total_papers} papers
                    </Badge>
                    <Badge className={
                      org.velocity > 30 
                        ? 'bg-green-500' 
                        : org.velocity < -30 
                        ? 'bg-red-500' 
                        : 'bg-blue-500'
                    }>
                      {org.velocity > 0 ? '+' : ''}{org.velocity}%
                    </Badge>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={Object.entries(org.trend_data).map(([year, count]) => ({ year, count }))}>
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0B3D91" 
                      fill="#00A9CE" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </Card>
      )}

      {trendsData.collaboration_network && trendsData.collaboration_network.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Network className="w-6 h-6 text-[#0B3D91]" />
            <h3 className="text-xl font-bold text-gray-800">Cross-Organism Research Connections</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendsData.collaboration_network.map((conn, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{conn.organism1}</Badge>
                    <span className="text-gray-400">↔</span>
                    <Badge variant="outline">{conn.organism2}</Badge>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Studies together: {conn.co_occurrences}</span>
                  <span>Strength: {conn.strength}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {trendsData.topic_evolution && trendsData.topic_evolution.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-[#0B3D91]" />
            <h3 className="text-xl font-bold text-gray-800">Topic Evolution Timeline</h3>
          </div>
          <div className="space-y-3">
            {trendsData.topic_evolution.slice(0, 10).map((topic, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold">{topic.topic}</p>
                  <Badge className="bg-[#00A9CE]">
                    Momentum: {topic.recent_momentum}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>First: {topic.first_seen}</span>
                  <span>Latest: {topic.last_seen}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {yearData.length > 0 && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-[#0B3D91]" />
              <h3 className="text-xl font-bold text-gray-800">Research by Year</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '2px solid #0B3D91', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', padding: '12px' }} labelStyle={{ fontWeight: 'bold', color: '#0B3D91' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Line type="monotone" dataKey="papers" stroke="#0B3D91" strokeWidth={3} dot={{ fill: '#00A9CE', r: 5 }} activeDot={{ r: 7, fill: '#FC3D21' }} name="Papers Published" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {organismData.length > 0 && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Dna className="w-6 h-6 text-[#00A9CE]" />
              <h3 className="text-xl font-bold text-gray-800">Top Organisms Studied</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={organismData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                  {organismData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '2px solid #00A9CE', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {topicData.length > 0 && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#FC3D21]" />
              <h3 className="text-xl font-bold text-gray-800">Top Research Topics</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topicData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" style={{ fontSize: '11px', fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '2px solid #FC3D21', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', padding: '12px' }} labelStyle={{ fontWeight: 'bold', color: '#0B3D91' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[0, 8, 8, 0]} name="Mentions" />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0B3D91" />
                    <stop offset="100%" stopColor="#00A9CE" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
