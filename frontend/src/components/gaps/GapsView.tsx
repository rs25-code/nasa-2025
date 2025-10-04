import { useEffect, useState } from 'react';
import { analyzeGaps } from '@/services/api';
import type { Persona, GapAnalysis } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lightbulb, AlertTriangle, HelpCircle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GapsViewProps {
  currentPersona: Persona;
}

export default function GapsView({ currentPersona }: GapsViewProps) {
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGaps = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await analyzeGaps();
        setGapAnalysis(data);
      } catch (err) {
        setError('Failed to load gap analysis. Please check your backend connection.');
        console.error('Gap analysis error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGaps();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
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

  if (!gapAnalysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-nasa-blue" />
        <div>
          <h2 className="text-3xl font-bold text-nasa-darkgray">Research Gap Analysis</h2>
          <p className="text-gray-600">Identify under-researched areas and opportunities</p>
        </div>
      </div>

      {/* Under-researched Areas */}
      {gapAnalysis.under_researched_areas && gapAnalysis.under_researched_areas.length > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-nasa-darkgray mb-3">
                Under-Researched Areas
              </h3>
              <p className="text-gray-600 mb-4">
                These topics have limited coverage in the current research database
              </p>
              <div className="space-y-3">
                {gapAnalysis.under_researched_areas.map((area, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border border-orange-200"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1 bg-orange-100 text-orange-700 border-orange-300">
                        Gap #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700">{area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Missing Approaches */}
      {gapAnalysis.missing_approaches && gapAnalysis.missing_approaches.length > 0 && (
        <Card className="p-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-nasa-darkgray mb-3">
                Missing Research Approaches
              </h3>
              <p className="text-gray-600 mb-4">
                Methodologies or perspectives that could enhance the research
              </p>
              <div className="space-y-3">
                {gapAnalysis.missing_approaches.map((approach, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-700 border-blue-300">
                        Approach #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700">{approach}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Critical Questions */}
      {gapAnalysis.critical_questions && gapAnalysis.critical_questions.length > 0 && (
        <Card className="p-6 border-purple-200 bg-purple-50/50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-nasa-darkgray mb-3">
                Critical Unanswered Questions
              </h3>
              <p className="text-gray-600 mb-4">
                Key questions that need to be addressed in future research
              </p>
              <div className="space-y-3">
                {gapAnalysis.critical_questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border border-purple-200"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-700 border-purple-300">
                        Q{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {gapAnalysis.recommendations && gapAnalysis.recommendations.length > 0 && (
        <Card className="p-6 border-green-200 bg-green-50/50">
          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-nasa-darkgray mb-3">
                Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Strategic suggestions for future research directions
              </p>
              <div className="space-y-3">
                {gapAnalysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border border-green-200"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 border-green-300">
                        #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
