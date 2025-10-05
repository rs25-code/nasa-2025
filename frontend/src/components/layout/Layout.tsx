import { useState } from 'react';
import Header from './Header';
import QuickStartDialog from './QuickStartDialog';
import SearchView from '../search/SearchView';
import TrendsView from '../visualizations/TrendsView';
import GapsView from '../gaps/GapsView';
import type { Persona } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Target } from 'lucide-react';

interface LayoutProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onBackToLanding?: () => void;
}

export default function Layout({ currentPersona, onPersonaChange, onBackToLanding }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <QuickStartDialog />
      <Header 
        currentPersona={currentPersona}
        onPersonaChange={onPersonaChange}
        onBackToLanding={onBackToLanding}
      />
      
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced tabs with better styling */}
          <div className="flex justify-center mb-10">
            <TabsList className="inline-flex h-auto p-1 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg">
              <TabsTrigger 
                value="search" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B3D91] data-[state=active]:to-[#1a5cc4] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-[10px] px-8 py-2.5 font-semibold flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </TabsTrigger>
              <TabsTrigger 
                value="trends"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B3D91] data-[state=active]:to-[#1a5cc4] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-[10px] px-8 py-2.5 font-semibold flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger 
                value="gaps"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0B3D91] data-[state=active]:to-[#1a5cc4] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-[10px] px-8 py-2.5 font-semibold flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Gap Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="search" className="mt-0">
            <SearchView currentPersona={currentPersona} />
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            <TrendsView currentPersona={currentPersona} />
          </TabsContent>

          <TabsContent value="gaps" className="mt-0">
            <GapsView currentPersona={currentPersona} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
