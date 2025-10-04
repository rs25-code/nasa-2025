import { personaConfigs } from '@/lib/personas';
import type { Persona } from '@/types';
import StatsWidget from './StatsWidget';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export default function Header({ currentPersona, onPersonaChange }: HeaderProps) {
  const currentConfig = personaConfigs[currentPersona];
  const CurrentIcon = currentConfig.icon;

  return (
    <header className="bg-nasa-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-nasa-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">
                  Space Biology Knowledge Engine
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-nasa-teal">
                    NASA Space Apps Challenge 2025
                  </p>
                  <StatsWidget />
                </div>
              </div>
            </div>
          </div>

          {/* Persona Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <CurrentIcon className="w-4 h-4 mr-2" />
                {currentConfig.name}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(personaConfigs).map((persona) => {
                const Icon = persona.icon;
                return (
                  <DropdownMenuItem
                    key={persona.id}
                    onClick={() => onPersonaChange(persona.id)}
                    className={currentPersona === persona.id ? 'bg-accent' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {persona.description.split(',')[0]}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
