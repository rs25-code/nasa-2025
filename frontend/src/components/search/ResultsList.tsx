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
}

export default function ResultsList({ results, isLoading, currentPersona }: ResultsListProps) {
  const [selectedPaper, setSelectedPaper] = useState<SearchResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePaperClick = (paper: SearchResult) => {
    console.log('Clicked paper:', paper);
    console.log('Paper text:', paper.text);
    console.log('Paper metadata:', paper.metadata);
    setSelectedPaper(paper);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
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
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">No results found</h3>
        <p className="text-gray-500 text-lg">
          Try adjusting your search query or filters
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-[#0B3D91]/10 to-[#00A9CE]/10 rounded-lg border-2 border-[#0B3D91]/20">
              <span className="text-sm text-gray-600">
                Found <span className="font-bold text-[#0B3D91] text-lg">{results.length}</span> results
              </span>
            </div>
          </div>
        </div>
        
        {results.map((result, index) => {
          const matchScore = result.score * 100;
          let scoreColor = 'bg-gray-100 text-gray-700 border-gray-300';
          let scoreLabel = 'Match';
          
          if (matchScore > 65) {
            scoreColor = 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400';
            scoreLabel = 'Excellent Match';
          } else if (matchScore > 60) {
            scoreColor = 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400';
            scoreLabel = 'Good Match';
          } else {
            scoreColor = 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400';
            scoreLabel = 'Relevant';
          }

          return (
            <Card 
              key={`${result.id}-${index}`} 
              onClick={() => handlePaperClick(result)}
              className="group p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-[#00A9CE] hover:shadow-2xl transition-all duration-300 card-hover animate-in cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#0B3D91] transition-colors leading-tight">
                      {result.metadata.file ? result.metadata.file.replace('.pdf', '') : 'Research Document'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {result.metadata.year && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                          <Calendar className="w-4 h-4 text-[#0B3D91]" />
                          <span className="font-semibold text-gray-700">{result.metadata.year}</span>
                        </div>
                      )}
                      {result.metadata.section && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                          <BookOpen className="w-4 h-4 text-[#00A9CE]" />
                          <span className="capitalize font-medium text-gray-700">{result.metadata.section}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Page {result.metadata.page}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Match Score */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl border-2 shadow-lg ${scoreColor} flex items-center gap-2`}>
                      <Award className="w-4 h-4" />
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                          {scoreLabel}
                        </span>
                        <span className="text-lg font-bold">
                          {matchScore.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0B3D91] to-[#00A9CE] rounded-full" />
                  <div className="pl-6 pr-4 py-2">
                    <p className="text-gray-700 leading-relaxed text-base line-clamp-3">
                      {result.text}
                    </p>
                  </div>
                </div>

                {/* Organisms */}
                {result.metadata.organisms && result.metadata.organisms.length > 0 && (
                  <div className="flex items-start gap-3 pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <Dna className="w-4 h-4 text-[#00A9CE]" />
                      <span>Organisms:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.metadata.organisms.map((organism) => (
                        <Badge 
                          key={organism} 
                          variant="outline" 
                          className="px-3 py-1 bg-gradient-to-r from-[#00A9CE]/10 to-[#0B3D91]/10 border-2 border-[#00A9CE]/30 text-[#0B3D91] font-medium hover:border-[#00A9CE] hover:shadow-md transition-all"
                        >
                          {organism}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Paper Detail Drawer */}
      <PaperDetailDrawer
        paper={selectedPaper}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        currentPersona={currentPersona}
      />
    </>
  );
}
