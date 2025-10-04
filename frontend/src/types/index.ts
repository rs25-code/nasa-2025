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
}

export interface TrendsData {
  research_by_year: Record<string, number>;
  top_organisms: Record<string, number>;
  top_topics: Record<string, number>;
  emerging_areas: string[];
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
