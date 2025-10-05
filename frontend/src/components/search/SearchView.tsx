import { useState } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ResultsList from './ResultsList';
import { searchPapers } from '@/services/api';
import type { Persona, SearchResult, SearchFilters } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SearchViewProps {
  currentPersona: Persona;
}

export default function SearchView({ currentPersona }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchPapers(searchQuery, 25, filters);
      setResults(response.results);
    } catch (err) {
      setError('Failed to search. Please check your backend connection.');
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Re-run search if there's an active query
    if (query) {
      setIsLoading(true);
      try {
        const response = await searchPapers(query, 25, newFilters);
        setResults(response.results);
      } catch (err) {
        setError('Failed to apply filters.');
        console.error('Filter error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSimilarPapersFound = (similarPapers: SearchResult[]) => {
    setResults(similarPapers);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar 
        currentPersona={currentPersona}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Area */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Results - FIXED: Added currentPersona prop */}
          <div className="lg:col-span-3">
            <ResultsList 
              results={results}
              isLoading={isLoading}
              currentPersona={currentPersona}
              onSimilarPapersFound={handleSimilarPapersFound}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Enter a search query or try one of the sample queries above
          </p>
        </div>
      )}
    </div>
  );
}
