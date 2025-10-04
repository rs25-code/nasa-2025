import axios from 'axios';
import type {
  SearchResponse,
  SummaryResponse,
  ConsensusResponse,
  GapAnalysis,
  TrendsData,
  FilterOptions,
  DatabaseStats,
  Persona,
  SearchResult,
  SearchFilters,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchPapers = async (
  query: string,
  topK: number = 25,
  filters?: SearchFilters
): Promise<SearchResponse> => {
  const response = await api.post('/search', {
    query,
    top_k: topK,
    filters: filters || {},
  });
  return response.data;
};

export const summarizeResults = async (
  query: string,
  results: SearchResult[],
  persona: Persona
): Promise<SummaryResponse> => {
  const response = await api.post('/summarize', {
    query,
    results,
    persona,
  });
  return response.data;
};

export const getConsensus = async (
  topic: string,
  results: SearchResult[]
): Promise<ConsensusResponse> => {
  const response = await api.post('/consensus', {
    topic,
    results,
  });
  return response.data;
};

export const analyzeGaps = async (
  results?: SearchResult[]
): Promise<GapAnalysis> => {
  const response = await api.post('/gaps', {
    results: results || [],
  });
  return response.data;
};

export const getTrends = async (): Promise<TrendsData> => {
  const response = await api.get('/trends');
  return response.data;
};

export const getFilterOptions = async (): Promise<FilterOptions> => {
  const response = await api.get('/filters');
  return response.data;
};

export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  const response = await api.get('/stats');
  return response.data;
};
