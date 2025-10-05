export type Persona = 'scientist' | 'investor' | 'architect';

export interface SearchResult {
  id: string;
  text: string;
  metadata: {
    file: string;
    page: number;
    chunk: number;
    year?: number;
    organisms?: string[];
    section?: string;
  };
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
}

export interface SummaryResponse {
  summary: string;
  key_points: string[];
  persona: Persona;
}

export interface ConsensusResponse {
  consensus_points: string[];
  disagreements: string[];
  confidence_level: string;
  supporting_evidence: Record<string, string[]>;
}

export interface GapAnalysis {
  under_researched_areas: string[];
  missing_approaches: string[];
  critical_questions: string[];
  recommendations: string[];
  quantitative_scoring: Array<{
    type: string;
    area: string;
    paper_count: number;
    severity_score: number;
    reason: string;
  }>;
  comparative_analysis: {
    organism_condition_gaps: Array<{
      organism: string;
      condition: string;
      status: string;
    }>;
    total_combinations: number;
    studied_combinations: number;
    coverage_percentage: number;
  };
}

export interface TrendsData {
  research_by_year: Record<string, number>;
  top_organisms: Record<string, number>;
  top_topics: Record<string, number>;
  emerging_areas: Array<{
    topic: string;
    recent_papers: number;
    growth_rate: number;
    total_papers: number;
  }>;
  temporal_analysis: {
    growth_rate: number;
    trend: string;
    peak_year: string;
    peak_papers: number;
  };
  collaboration_network: Array<{
    organism1: string;
    organism2: string;
    co_occurrences: number;
    strength: number;
  }>;
  organism_trends_by_year: Array<{
    organism: string;
    total_papers: number;
    trend_data: Record<string, number>;
    velocity: number;
    status: string;
  }>;
  topic_evolution: Array<{
    topic: string;
    timeline: Record<string, number>;
    recent_momentum: number;
    first_seen: string;
    last_seen: string;
  }>;
}

export interface FilterOptions {
  years: number[];
  organisms: string[];
  sections: string[];
}

export interface DatabaseStats {
  total_papers: number;
  total_vectors: number;
  index_fullness: number;
}

export interface SearchFilters {
  year?: number;
  organisms?: string[];
  section?: string;
}
