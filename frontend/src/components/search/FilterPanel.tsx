import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
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
      <Card className="p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Loading filters...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-nasa-blue" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Year Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Year</label>
        <Select
          value={filters.year?.toString() || 'all'}
          onValueChange={handleYearChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Organism Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Organisms</label>
        <div className="flex flex-wrap gap-2">
          {availableOrganisms.slice(0, 10).map((organism) => {
            const isSelected = filters.organisms?.includes(organism);
            return (
              <Badge
                key={organism}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-nasa-blue/20"
                onClick={() => handleOrganismToggle(organism)}
              >
                {organism}
              </Badge>
            );
          })}
        </div>
        {filters.organisms && filters.organisms.length > 0 && (
          <p className="text-xs text-gray-500">
            {filters.organisms.length} organism(s) selected
          </p>
        )}
      </div>

      {/* Section Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Section</label>
        <Select
          value={filters.section || 'all'}
          onValueChange={handleSectionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {availableSections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
