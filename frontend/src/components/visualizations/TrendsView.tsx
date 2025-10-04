import { useEffect, useState } from 'react';
import { getTrends } from '@/services/api';
import type { Persona, TrendsData } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Calendar, Dna, Sparkles } from 'lucide-react';
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

const COLORS = ['#0B3D91', '#FC3D21', '#00A9CE', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#3F51B5'];

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
        console.log('Trends data received:', data);
        console.log('Research by year:', data.research_by_year);
        console.log('Top organisms:', data.top_organisms);
        console.log('Top topics:', data.top_topics);
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
            <Card key={i} className="p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!trendsData) {
    return null;
  }

  // Transform data for charts
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-nasa-blue" />
        <div>
          <h2 className="text-3xl font-bold text-nasa-darkgray">Research Trends</h2>
          <p className="text-gray-600">Analyze patterns and emerging areas in space biology</p>
        </div>
      </div>

      {/* Emerging Areas */}
      {trendsData.emerging_areas && trendsData.emerging_areas.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-nasa-blue/5 to-nasa-teal/5 border-nasa-blue/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-nasa-teal flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-nasa-darkgray mb-3">Emerging Research Areas</h3>
              <div className="flex flex-wrap gap-2">
                {trendsData.emerging_areas.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium text-nasa-blue border border-nasa-blue/20"
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
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-nasa-blue" />
              <h3 className="text-lg font-semibold">Research Volume by Year</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="papers"
                  stroke="#0B3D91"
                  strokeWidth={2}
                  dot={{ fill: '#0B3D91', r: 4 }}
                  name="Papers Published"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Organisms */}
        {organismData.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Dna className="w-5 h-5 text-nasa-teal" />
              <h3 className="text-lg font-semibold">Most Studied Organisms</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={organismData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {organismData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Topics */}
        {topicData.length > 0 && (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-nasa-red" />
              <h3 className="text-lg font-semibold">Top Research Topics</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0B3D91" name="Number of Papers" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* No data message */}
        {yearData.length === 0 && organismData.length === 0 && topicData.length === 0 && (
          <Card className="p-12 text-center lg:col-span-2">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No trend data available</h3>
            <p className="text-gray-500">
              Process more papers to see research trends and patterns
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
