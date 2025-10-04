import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    onSearch(sampleQuery);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search space biology research..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-12 text-lg"
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={!query.trim() || isLoading}
          className="h-12 px-8 bg-nasa-blue hover:bg-nasa-blue/90"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Sample Queries */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Try these queries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSampleQuery(sample)}
              disabled={isLoading}
              className="text-xs hover:bg-nasa-blue/10 hover:border-nasa-blue"
            >
              {sample}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
