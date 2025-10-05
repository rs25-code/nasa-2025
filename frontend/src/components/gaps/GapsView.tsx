import { useEffect, useState } from 'react';
import { analyzeGaps } from '@/services/api';
import type { Persona, GapAnalysis } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lightbulb, AlertTriangle, HelpCircle, Target, BarChart3 } from 'lucide-react';
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
          <Card key={i} className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-2 shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-base">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!gapAnalysis) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in">
        <div className="p-4 bg-gradient-to-br from-[#0B3D91] to-[#1a5cc4] rounded-2xl shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Research Gap Analysis</h2>
          <p className="text-gray-600 text-lg mt-1">Identify under-researched areas and opportunities</p>
        </div>
      </div>

      {/* Under-researched Areas */}
      {gapAnalysis.under_researched_areas && gapAnalysis.under_researched_areas.length > 0 && (
        <Card className="p-8 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Under-Researched Areas
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                Topics and areas that need more scientific attention
              </p>
              <div className="space-y-4">
                {gapAnalysis.under_researched_areas.map((area, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <Badge className="mt-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md text-sm px-3 py-1">
                        Area #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed font-medium">{area}</p>
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
        <Card className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Missing Research Approaches
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                Methodologies and techniques that haven't been fully explored
              </p>
              <div className="space-y-4">
                {gapAnalysis.missing_approaches.map((approach, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <Badge className="mt-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md text-sm px-3 py-1">
                        Approach #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed font-medium">{approach}</p>
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
        <Card className="p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Critical Unanswered Questions
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                Key questions that need to be addressed in future research
              </p>
              <div className="space-y-4">
                {gapAnalysis.critical_questions.map((question, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md text-sm px-3 py-1">
                        Q{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed font-medium">{question}</p>
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
        <Card className="p-8 bg-gradient-to-br from-green-50 via-white to-green-50/50 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Strategic Recommendations
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                Actionable suggestions for future research directions
              </p>
              <div className="space-y-4">
                {gapAnalysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <Badge className="mt-1 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md text-sm px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed font-medium">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
{/* Quantitative Gap Scoring */}
{gapAnalysis.quantitative_scoring && gapAnalysis.quantitative_scoring.length > 0 && (
  <Card className="p-8 bg-gradient-to-br from-red-50 via-white to-red-50/50 border-2 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
        <BarChart3 className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Quantitative Gap Scoring
        </h3>
        <p className="text-gray-600 mb-6 text-base">
          Gaps ranked by severity (1-10 scale)
        </p>
        <div className="space-y-3">
          {gapAnalysis.quantitative_scoring.slice(0, 10).map((gap, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg border-2 border-red-200 hover:border-red-400 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge className={
                    gap.severity_score >= 8 
                      ? 'bg-red-600' 
                      : gap.severity_score >= 5 
                      ? 'bg-orange-500' 
                      : 'bg-yellow-500'
                  }>
                    Severity: {gap.severity_score}/10
                  </Badge>
                  <Badge variant="outline">{gap.type}</Badge>
                </div>
                <span className="text-sm text-gray-600">{gap.paper_count} papers</span>
              </div>
              <p className="font-semibold text-gray-800 mb-1">{gap.area}</p>
              <p className="text-sm text-gray-600">{gap.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Card>
)}

{/* Comparative Gap Analysis */}
{gapAnalysis.comparative_analysis && (
  <Card className="p-8 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
        <Network className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Cross-Reference Gap Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
            <p className="text-sm text-gray-600 mb-1">Coverage</p>
            <p className="text-3xl font-bold text-indigo-600">
              {gapAnalysis.comparative_analysis.coverage_percentage}%
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
            <p className="text-sm text-gray-600 mb-1">Studied</p>
            <p className="text-3xl font-bold text-indigo-600">
              {gapAnalysis.comparative_analysis.studied_combinations}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
            <p className="text-sm text-gray-600 mb-1">Possible</p>
            <p className="text-3xl font-bold text-indigo-600">
              {gapAnalysis.comparative_analysis.total_combinations}
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-base">
          Organism-Condition combinations not yet studied:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {gapAnalysis.comparative_analysis.organism_condition_gaps.slice(0, 20).map((gap, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-lg border border-indigo-200"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{gap.organism}</Badge>
                <span className="text-gray-400">×</span>
                <Badge variant="outline" className="text-xs">{gap.condition}</Badge>
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
