import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { personaConfigs } from '@/lib/personas';
import type { Persona } from '@/types';

interface SearchBarProps {
  currentPersona: Persona;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ currentPersona, onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const sampleQueries = personaConfigs[currentPersona].sampleQueries;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleSampleQuery = (sample: string) => {
    setQuery(sample);
    onSearch(sample);
  };

  return (
    <div className="space-y-6">
      {/* Search input with enhanced styling */}
      <Card className="p-6 shadow-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D91]/10 to-[#00A9CE]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <div className="relative flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-5 py-4 focus-within:border-[#00A9CE] focus-within:ring-4 focus-within:ring-[#00A9CE]/20 transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A9CE] transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask anything about space biology research...`}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-lg bg-transparent"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] hover:from-[#1a5cc4] hover:to-[#00A9CE] text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Sample queries with enhanced styling */}
      <div className="animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#00A9CE]" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Try these {personaConfigs[currentPersona].name} queries
          </h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleQuery(sample)}
              disabled={isLoading}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D91]/5 to-[#00A9CE]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <Badge 
                variant="outline"
                className="relative px-4 py-2.5 text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-[#00A9CE] hover:text-[#0B3D91] hover:shadow-md transition-all duration-300 cursor-pointer font-medium"
              >
                {sample}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
