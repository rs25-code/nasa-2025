import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Dna, BookOpen, Award } from 'lucide-react';
import type { SearchResult, Persona } from '@/types';
import PaperDetailDrawer from './PaperDetailDrawer';

interface ResultsListProps {
  results: SearchResult[];
  isLoading?: boolean;
  currentPersona: Persona;
  onSimilarPapersFound?: (papers: SearchResult[]) => void;
}

export default function ResultsList({ 
  results, 
  isLoading, 
  currentPersona,
  onSimilarPapersFound 
}: ResultsListProps) {
  const [selectedPaper, setSelectedPaper] = useState<SearchResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePaperClick = (paper: SearchResult) => {
    setSelectedPaper(paper);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSimilarPapersClick = (similarPapers: SearchResult[]) => {
    if (onSimilarPapersFound) {
      onSimilarPapersFound(similarPapers);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
                <div className="h-8 bg-gray-200 rounded-full w-24" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-center shadow-lg">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h3>
        <p className="text-gray-500">Try adjusting your search query or filters</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {results.map((result, index) => {
          const matchScore = result.score * 100;
          let scoreColor = 'from-gray-400 to-gray-500';
          let scoreLabel = 'Relevant';

          if (matchScore > 65) {
            scoreColor = 'from-green-500 to-emerald-500';
            scoreLabel = 'Excellent Match';
          } else if (matchScore > 60) {
            scoreColor = 'from-blue-500 to-cyan-500';
            scoreLabel = 'Good Match';
          }

          return (
            <Card
              key={result.id || index}
              className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-[#0B3D91]/30 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => handlePaperClick(result)}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#0B3D91] transition-colors leading-tight">
                    {result.metadata.file ? result.metadata.file.replace('.pdf', '') : 'Research Document'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                    {result.metadata.year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#0B3D91]" />
                        <span>{result.metadata.year}</span>
                      </div>
                    )}
                    {result.metadata.section && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#0B3D91]" />
                        <span className="capitalize">{result.metadata.section}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0B3D91]" />
                      <span>Page {result.metadata.page}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                    {result.text}
                  </p>

                  {result.metadata.organisms && result.metadata.organisms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Dna className="w-5 h-5 text-[#00A9CE] flex-shrink-0 mt-0.5" />
                      {result.metadata.organisms.slice(0, 3).map((organism) => (
                        <Badge
                          key={organism}
                          className="px-3 py-1 bg-gradient-to-r from-[#00A9CE]/10 to-[#0B3D91]/10 border border-[#00A9CE]/30 text-[#0B3D91] text-xs font-medium"
                        >
                          {organism}
                        </Badge>
                      ))}
                      {result.metadata.organisms.length > 3 && (
                        <Badge className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-600 text-xs">
                          +{result.metadata.organisms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className={`flex-shrink-0 px-4 py-3 rounded-xl bg-gradient-to-br ${scoreColor} text-white shadow-lg`}>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <Award className="w-6 h-6 mb-1" />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                      {scoreLabel}
                    </span>
                    <span className="text-2xl font-bold mt-1">
                      {matchScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <PaperDetailDrawer
        paper={selectedPaper}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        currentPersona={currentPersona}
        onSimilarPapersClick={handleSimilarPapersClick}
      />
    </>
  );
}
