import { useEffect, useState } from 'react';
import { getTrends } from '@/services/api';
import type { Persona, TrendsData } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Calendar, Dna, Sparkles, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
        setError('Failed to load trends data. Please check your backend connection.');
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
            <Card key={i} className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
              <Skeleton className="h-80 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-2 shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-base">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!trendsData) {
    return null;
  }

  const yearData = trendsData.research_by_year && typeof trendsData.research_by_year === 'object'
    ? Object.entries(trendsData.research_by_year).map(([year, count]) => ({
        year,
        papers: typeof count === 'number' ? count : 0,
      })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
    : [];

  const organismData = trendsData.top_organisms && typeof trendsData.top_organisms === 'object'
    ? Object.entries(trendsData.top_organisms)
        .map(([name, data]: [string, any]) => ({ 
          name, 
          value: typeof data === 'number' ? data : data?.count || 0 
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  const topicData = trendsData.top_topics && typeof trendsData.top_topics === 'object'
    ? Object.entries(trendsData.top_topics)
        .map(([name, data]: [string, any]) => ({ 
          name, 
          count: typeof data === 'number' ? data : data?.count || 0 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in">
        <div className="p-4 bg-gradient-to-br from-[#0B3D91] to-[#1a5cc4] rounded-2xl shadow-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Research Trends</h2>
          <p className="text-gray-600 text-lg mt-1">Analyze patterns and emerging areas in space biology</p>
        </div>
      </div>

      {/* Emerging Areas */}
      {trendsData.emerging_areas && trendsData.emerging_areas.length > 0 && (
        <Card className="p-8 bg-gradient-to-br from-[#0B3D91]/5 via-white to-[#00A9CE]/5 border-2 border-[#0B3D91]/20 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-[#00A9CE] to-[#0B3D91] rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Emerging Research Areas</h3>
              <div className="flex flex-wrap gap-3">
                {trendsData.emerging_areas.map((area, index) => (
                  <span
                    key={index}
                    className="px-5 py-3 bg-white rounded-full text-sm font-semibold text-[#0B3D91] border-2 border-[#0B3D91]/20 shadow-md hover:shadow-lg hover:border-[#00A9CE] hover:text-[#00A9CE] transition-all duration-300 cursor-default"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research by Year */}
        {yearData.length > 0 && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-[#0B3D91]" />
              <h3 className="text-xl font-bold text-gray-800">Research by Year</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #0B3D91',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0B3D91' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="papers" 
                  stroke="#0B3D91" 
                  strokeWidth={3}
                  dot={{ fill: '#00A9CE', r: 5 }}
                  activeDot={{ r: 7, fill: '#FC3D21' }}
                  name="Papers Published"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Organisms Pie Chart */}
        {organismData.length > 0 && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Dna className="w-6 h-6 text-[#00A9CE]" />
              <h3 className="text-xl font-bold text-gray-800">Top Organisms Studied</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={organismData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {organismData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #00A9CE',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Topics Bar Chart */}
        {topicData.length > 0 && (
          <Card className="lg:col-span-2 p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#FC3D21]" />
              <h3 className="text-xl font-bold text-gray-800">Top Research Topics</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topicData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #FC3D21',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0B3D91' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#colorGradient)" 
                  radius={[0, 8, 8, 0]}
                  name="Mentions"
                />
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
