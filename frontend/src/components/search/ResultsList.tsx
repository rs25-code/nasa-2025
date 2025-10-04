import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Dna, BookOpen } from 'lucide-react';
import type { SearchResult } from '@/types';

interface ResultsListProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export default function ResultsList({ results, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
        <p className="text-gray-500">
          Try adjusting your search query or filters
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Found <span className="font-semibold">{results.length}</span> results
      </div>
      
      {results.map((result, index) => (
        <Card key={`${result.id}-${index}`} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-nasa-darkgray mb-2">
                  {result.metadata.file ? result.metadata.file.replace('.pdf', '') : 'Research Document'}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {result.metadata.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{result.metadata.year}</span>
                    </div>
                  )}
                  {result.metadata.section && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="capitalize">{result.metadata.section}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Page {result.metadata.page}</span>
                  </div>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="secondary"
                  className={`
                    ${result.score > 0.65 ? 'bg-green-100 text-green-800' : ''}
                    ${result.score > 0.60 && result.score <= 0.65 ? 'bg-blue-100 text-blue-800' : ''}
                    ${result.score <= 0.60 ? 'bg-gray-100 text-gray-800' : ''}
                  `}
                >
                  {(result.score * 100).toFixed(1)}% match
                </Badge>
              </div>
            </div>

            {/* Content Preview */}
            <div className="text-gray-700 leading-relaxed">
              <p className="line-clamp-3">{result.text}</p>
            </div>

            {/* Organisms */}
            {result.metadata.organisms && result.metadata.organisms.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Dna className="w-4 h-4 text-nasa-teal" />
                <div className="flex flex-wrap gap-1">
                  {result.metadata.organisms.map((organism) => (
                    <Badge key={organism} variant="outline" className="text-xs">
                      {organism}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
