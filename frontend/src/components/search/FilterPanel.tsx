import { useEffect, useState } from 'react';
import { Filter, X, Calendar, Dna, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFilterOptions } from '@/services/api';
import type { SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableOrganisms, setAvailableOrganisms] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const options = await getFilterOptions();
        setAvailableYears(options.years.sort((a, b) => b - a));
        setAvailableOrganisms(options.organisms.sort());
        setAvailableSections(options.sections.sort());
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFilters();
  }, []);

  const handleYearChange = (value: string) => {
    onFiltersChange({
      ...filters,
      year: value === 'all' ? undefined : parseInt(value),
    });
  };

  const handleOrganismToggle = (organism: string) => {
    const currentOrganisms = filters.organisms || [];
    const newOrganisms = currentOrganisms.includes(organism)
      ? currentOrganisms.filter((o) => o !== organism)
      : [...currentOrganisms, organism];
    
    onFiltersChange({
      ...filters,
      organisms: newOrganisms.length > 0 ? newOrganisms : undefined,
    });
  };

  const handleSectionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      section: value === 'all' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.year || filters.organisms?.length || filters.section;

  if (isLoading) {
    return (
      <Card className="p-6 shadow-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24 p-6 shadow-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#0B3D91]" />
            <h3 className="font-bold text-lg text-gray-800">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-gray-600 hover:text-[#FC3D21] hover:bg-red-50 transition-colors"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Year Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00A9CE]" />
            <label className="text-sm font-semibold text-gray-700">Year</label>
          </div>
          <Select
            value={filters.year?.toString() || 'all'}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#00A9CE] focus:ring-2 focus:ring-[#00A9CE]/20 transition-all">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
              <SelectItem value="all" className="font-medium">All years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organisms Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-[#00A9CE]" />
            <label className="text-sm font-semibold text-gray-700">Organisms</label>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border-2 border-gray-100">
            {availableOrganisms.map((organism) => {
              const isSelected = filters.organisms?.includes(organism);
              return (
                <button
                  key={organism}
                  onClick={() => handleOrganismToggle(organism)}
                  className="group"
                >
                  <Badge
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] text-white shadow-md hover:shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#00A9CE] hover:bg-[#00A9CE]/5'
                    }`}
                  >
                    {organism}
                  </Badge>
                </button>
              );
            })}
          </div>
          {filters.organisms && filters.organisms.length > 0 && (
            <p className="text-xs text-gray-500 italic">
              {filters.organisms.length} organism{filters.organisms.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Section Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#00A9CE]" />
            <label className="text-sm font-semibold text-gray-700">Section</label>
          </div>
          <Select
            value={filters.section || 'all'}
            onValueChange={handleSectionChange}
          >
            <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#00A9CE] focus:ring-2 focus:ring-[#00A9CE]/20 transition-all">
              <SelectValue placeholder="All sections" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
              <SelectItem value="all" className="font-medium">All sections</SelectItem>
              {availableSections.map((section) => (
                <SelectItem key={section} value={section} className="capitalize">
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
