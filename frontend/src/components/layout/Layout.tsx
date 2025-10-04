import { useState } from 'react';
import Header from './Header';
import QuickStartDialog from './QuickStartDialog';
import SearchView from '../search/SearchView';
import TrendsView from '../visualizations/TrendsView';
import GapsView from '../gaps/GapsView';
import type { Persona } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LayoutProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export default function Layout({ currentPersona, onPersonaChange }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-nasa-lightgray">
      <QuickStartDialog />
      <Header 
        currentPersona={currentPersona}
        onPersonaChange={onPersonaChange}
      />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-0 animate-in">
            <SearchView currentPersona={currentPersona} />
          </TabsContent>

          <TabsContent value="trends" className="mt-0 animate-in">
            <TrendsView currentPersona={currentPersona} />
          </TabsContent>

          <TabsContent value="gaps" className="mt-0 animate-in">
            <GapsView currentPersona={currentPersona} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
