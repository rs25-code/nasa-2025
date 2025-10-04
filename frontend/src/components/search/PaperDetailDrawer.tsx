import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Dna, BookOpen, Award, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { summarizeResults } from '@/services/api';
import type { SearchResult, Persona } from '@/types';

interface PaperDetailDrawerProps {
  paper: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  currentPersona: Persona;
}

export default function PaperDetailDrawer({ paper, isOpen, onClose, currentPersona }: PaperDetailDrawerProps) {
  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (paper && isOpen && currentPersona) {
      loadSummary();
    }
  }, [paper, isOpen, currentPersona]);

  const loadSummary = async () => {
    if (!paper || !currentPersona) return;

    setIsLoadingSummary(true);
    try {
      const queryText = paper.metadata.file?.replace('.pdf', '') || 'space biology';
      
      const result = await summarizeResults(
        queryText,
        [paper],
        currentPersona
      );
      setSummary(result.summary);
      setKeyPoints(result.key_points || []);
    } catch (error) {
      console.error('Failed to load summary:', error);
      setSummary('Unable to generate summary. The summarization service may be unavailable.');
      setKeyPoints([]);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (!paper) return null;

  const matchScore = paper.score * 100;
  let scoreColor = 'from-gray-400 to-gray-500';
  let scoreLabel = 'Relevant';

  if (matchScore > 65) {
    scoreColor = 'from-green-500 to-emerald-500';
    scoreLabel = 'Excellent Match';
  } else if (matchScore > 60) {
    scoreColor = 'from-blue-500 to-cyan-500';
    scoreLabel = 'Good Match';
  }

  // Get text from paper - handle different possible field names
  const paperText = paper.text || paper.metadata?.text || (paper as any).title || '';
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] text-white p-6 shadow-lg z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                {paper.metadata.file ? paper.metadata.file.replace('.pdf', '') : 'Research Document'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {paper.metadata.year && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                    <Calendar className="w-4 h-4" />
                    <span>{paper.metadata.year}</span>
                  </div>
                )}
                {paper.metadata.section && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="capitalize">{paper.metadata.section}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                  <FileText className="w-4 h-4" />
                  <span>Page {paper.metadata.page}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Match Score */}
          <div className="mt-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${scoreColor} text-white shadow-lg`}>
              <Award className="w-5 h-5" />
              <div className="flex flex-col">
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Full Text */}
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B3D91]" />
              Text Excerpt
            </h3>
            {paperText && paperText.trim() ? (
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0B3D91] to-[#00A9CE] rounded-full" />
                <p className="pl-6 text-gray-700 leading-relaxed text-base">
                  {paperText}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No text excerpt available for this chunk</p>
            )}
          </Card>

          {/* AI Summary */}
          <Card className="p-6 bg-gradient-to-br from-[#0B3D91]/5 via-white to-[#00A9CE]/5 border-2 border-[#0B3D91]/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00A9CE]" />
              AI Summary
            </h3>

            {isLoadingSummary ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#0B3D91] animate-spin" />
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {summary}
                </p>

                {keyPoints.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Key Points:</h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0B3D91] to-[#00A9CE] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">Generating summary...</p>
            )}
          </Card>

          {/* Organisms */}
          {paper.metadata.organisms && paper.metadata.organisms.length > 0 && (
            <Card className="p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Dna className="w-5 h-5 text-[#00A9CE]" />
                Organisms Studied
              </h3>
              <div className="flex flex-wrap gap-2">
                {paper.metadata.organisms.map((organism) => (
                  <Badge
                    key={organism}
                    className="px-4 py-2 bg-gradient-to-r from-[#00A9CE]/10 to-[#0B3D91]/10 border-2 border-[#00A9CE]/30 text-[#0B3D91] font-medium hover:border-[#00A9CE] hover:shadow-md transition-all text-sm"
                  >
                    {organism}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] hover:from-[#1a5cc4] hover:to-[#00A9CE] text-white shadow-lg hover:shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                alert('Find Similar Papers feature coming soon!');
              }}
            >
              Find Similar Papers
            </Button>
            <Button
              variant="outline"
              className="border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                const citation = `${paper.metadata.file?.replace('.pdf', '')} (${paper.metadata.year || 'n.d.'}). Page ${paper.metadata.page}.`;
                navigator.clipboard.writeText(citation);
                alert('Citation copied to clipboard!');
              }}
            >
              Export Citation
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
