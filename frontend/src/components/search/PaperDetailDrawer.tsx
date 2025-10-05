import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Dna, BookOpen, Award, Sparkles, Loader2, Search, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { summarizeResults, searchPapers } from '@/services/api';
import type { SearchResult, Persona } from '@/types';

interface PaperDetailDrawerProps {
  paper: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  currentPersona: Persona;
  onSimilarPapersClick?: (papers: SearchResult[]) => void;
}

export default function PaperDetailDrawer({ 
  paper, 
  isOpen, 
  onClose, 
  currentPersona,
  onSimilarPapersClick 
}: PaperDetailDrawerProps) {
  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string>('');
  const [isFindingSimilar, setIsFindingSimilar] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);

  // Auto-load summary when drawer opens
  useEffect(() => {
    console.log('=== DRAWER USEEFFECT TRIGGERED ===');
    console.log('isOpen:', isOpen);
    console.log('paper exists:', !!paper);
    console.log('currentPersona:', currentPersona);
    
    if (paper && isOpen && currentPersona) {
      console.log('=== DRAWER OPENED - CALLING LOAD SUMMARY ===');
      console.log('Paper data:', paper);
      console.log('Has text field:', 'text' in paper);
      console.log('Text value:', paper.text);
      console.log('Text length:', paper.text?.length || 0);
      
      // Call loadSummary with a small delay to ensure everything is ready
      setTimeout(() => {
        console.log('=== TIMEOUT: CALLING LOAD SUMMARY NOW ===');
        loadSummary();
      }, 100);
    } else {
      console.log('=== SKIPPING LOAD SUMMARY ===');
      console.log('Reason - paper:', !!paper, 'isOpen:', isOpen, 'persona:', currentPersona);
    }
  }, [paper, isOpen, currentPersona]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSummary('');
      setKeyPoints([]);
      setSummaryError('');
      setCitationCopied(false);
    }
  }, [isOpen]);

  const loadSummary = async () => {
    console.log('🚀 === LOAD SUMMARY FUNCTION CALLED ===');
    console.log('🚀 Paper:', paper);
    console.log('🚀 Current Persona:', currentPersona);
    
    if (!paper || !currentPersona) {
      console.log('❌ ABORTING: Missing paper or persona');
      console.log('❌ Paper exists:', !!paper);
      console.log('❌ Persona:', currentPersona);
      return;
    }

    console.log('✅ Starting summary generation...');
    setIsLoadingSummary(true);
    setSummary('');
    setKeyPoints([]);
    setSummaryError('');
    
    try {
      console.log('=== LOADING SUMMARY ===');
      console.log('Current persona:', currentPersona);
      console.log('Paper object:', JSON.stringify(paper, null, 2));
      
      const queryText = paper.metadata?.file?.replace('.pdf', '') || 'space biology research';
      console.log('Query text for summary:', queryText);
      
      console.log('📞 Calling summarizeResults API...');
      const result = await summarizeResults(
        queryText,
        [paper],  // Sending the full paper object
        currentPersona
      );
      
      console.log('📥 Summary API response:', result);
      
      if (result.summary) {
        console.log('✅ Summary received successfully');
        setSummary(result.summary);
        setKeyPoints(result.key_points || []);
      } else {
        console.error('❌ No summary in response');
        setSummaryError('No summary generated. Please try again.');
      }
    } catch (error: any) {
      console.error('💥 === SUMMARY ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setSummaryError(`Failed to generate summary: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    } finally {
      console.log('🏁 Summary loading finished');
      setIsLoadingSummary(false);
    }
  };

  const handleFindSimilar = async () => {
    if (!paper) return;

    setIsFindingSimilar(true);
    try {
      const paperTitle = paper.metadata?.file?.replace('.pdf', '') || '';
      const paperText = paper.text || '';
      const organisms = paper.metadata?.organisms || [];
      const currentPaperId = paper.metadata?.paper_id || '';
      
      // Build search query
      let searchQuery = '';
      if (organisms.length > 0) {
        searchQuery = organisms.slice(0, 3).join(' ');
      }
      if (paperTitle) {
        searchQuery = searchQuery ? `${searchQuery} ${paperTitle}` : paperTitle;
      }
      if (!searchQuery && paperText) {
        searchQuery = paperText.substring(0, 200);
      }
      if (!searchQuery) {
        searchQuery = 'space biology research';
      }
      
      console.log('Finding similar papers with query:', searchQuery);
      console.log('Current paper ID:', currentPaperId);
      
      const response = await searchPapers(searchQuery.substring(0, 100), 25);
      
      // Filter out chunks from the same paper (not just same chunk ID)
      // Group by paper_id to get unique papers only
      const uniquePapers = new Map<string, SearchResult>();
      
      for (const result of response.results) {
        const resultPaperId = result.metadata?.paper_id || result.id;
        
        // Skip if it's the current paper
        if (resultPaperId === currentPaperId) {
          continue;
        }
        
        // Keep only the highest scoring chunk from each unique paper
        if (!uniquePapers.has(resultPaperId) || 
            result.score > (uniquePapers.get(resultPaperId)?.score || 0)) {
          uniquePapers.set(resultPaperId, result);
        }
      }
      
      const similarPapers = Array.from(uniquePapers.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 unique papers
      
      console.log(`Found ${similarPapers.length} unique similar papers`);
      
      if (similarPapers.length > 0 && onSimilarPapersClick) {
        onSimilarPapersClick(similarPapers);
        onClose();
      } else if (similarPapers.length > 0) {
        alert(`Found ${similarPapers.length} similar papers.`);
      } else {
        alert('No similar papers found.');
      }
    } catch (error: any) {
      console.error('Error finding similar papers:', error);
      alert(`Failed to find similar papers: ${error.message}`);
    } finally {
      setIsFindingSimilar(false);
    }
  };

  const handleExportCitation = () => {
    if (!paper) return;

    // Extract metadata with fallbacks
    const year = paper.metadata?.year || 'n.d.';
    const title = paper.metadata?.title || paper.metadata?.file?.replace('.pdf', '') || 'Unknown Document';
    const authors = paper.metadata?.authors || [];
    const page = paper.metadata?.page || 'n.a.';
    
    // Format authors in APA style
    let authorString = 'Unknown Author';
    if (authors && authors.length > 0) {
      if (authors.length === 1) {
        authorString = authors[0];
      } else if (authors.length === 2) {
        authorString = `${authors[0]} & ${authors[1]}`;
      } else if (authors.length > 2) {
        // For 3+ authors, list all with & before last
        const lastAuthor = authors[authors.length - 1];
        const otherAuthors = authors.slice(0, -1).join(', ');
        authorString = `${otherAuthors}, & ${lastAuthor}`;
      }
    }
    
    // APA 7th edition format: Author(s). (Year). Title. Source. Page.
    const citation = `${authorString}. (${year}). ${title}. NASA Space Biology Research Database. p. ${page}.`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(citation)
        .then(() => {
          setCitationCopied(true);
          setTimeout(() => setCitationCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Clipboard API failed:', err);
          fallbackCopyToClipboard(citation);
        });
    } else {
      // Use fallback for older browsers or when clipboard API is not available
      fallbackCopyToClipboard(citation);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        setCitationCopied(true);
        setTimeout(() => setCitationCopied(false), 2000);
      } else {
        alert('Failed to copy citation. Please copy manually:\n\n' + text);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('Failed to copy citation. Please copy manually:\n\n' + text);
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

  const paperText = paper.text || '';
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] text-white p-6 shadow-lg z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                {paper.metadata?.file ? paper.metadata.file.replace('.pdf', '') : 'Research Document'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {paper.metadata?.year && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                    <Calendar className="w-4 h-4" />
                    <span>{paper.metadata.year}</span>
                  </div>
                )}
                {paper.metadata?.section && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="capitalize">{paper.metadata.section}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                  <FileText className="w-4 h-4" />
                  <span>Page {paper.metadata?.page || 'N/A'}</span>
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

        <div className="p-6 space-y-6">
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
              <p className="text-gray-500 italic">No text excerpt available</p>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#0B3D91]/5 via-white to-[#00A9CE]/5 border-2 border-[#0B3D91]/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00A9CE]" />
              AI Summary
            </h3>

            {isLoadingSummary ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-[#0B3D91] animate-spin" />
                <p className="text-sm text-gray-600">Generating AI summary...</p>
              </div>
            ) : summaryError ? (
              <div className="space-y-3">
                <p className="text-red-600">{summaryError}</p>
                <Button
                  onClick={loadSummary}
                  size="sm"
                  className="bg-[#0B3D91] hover:bg-[#1a5cc4]"
                >
                  Try Again
                </Button>
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
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <p className="text-gray-500 italic">Loading summary...</p>
              </div>
            )}
          </Card>

          {paper.metadata?.organisms && paper.metadata.organisms.length > 0 && (
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

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] hover:from-[#1a5cc4] hover:to-[#00A9CE] text-white shadow-lg hover:shadow-xl"
              onClick={handleFindSimilar}
              disabled={isFindingSimilar}
            >
              {isFindingSimilar ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Similar Papers
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#0B3D91] text-[#0B3D91] hover:bg-[#0B3D91] hover:text-white"
              onClick={handleExportCitation}
            >
              {citationCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Export Citation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
