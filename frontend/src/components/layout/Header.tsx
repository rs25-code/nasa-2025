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
import { ChevronDown, Rocket } from 'lucide-react';

interface HeaderProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  onBackToLanding?: () => void;
}

export default function Header({ currentPersona, onPersonaChange, onBackToLanding }: HeaderProps) {
  const currentConfig = personaConfigs[currentPersona];
  const CurrentIcon = currentConfig.icon;

  return (
    <header className="bg-gradient-to-r from-[#0B3D91] via-[#1a5cc4] to-[#0B3D91] text-white shadow-2xl sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title with enhanced styling */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Animated logo - CLICKABLE */}
              <button 
                onClick={onBackToLanding}
                className="relative group focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
              >
                <div className="absolute inset-0 bg-[#FC3D21] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#FC3D21] to-[#fc6d21] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
              </button>
              
              {/* Title section - CLICKABLE */}
              <div>
                <button
                  onClick={onBackToLanding}
                  className="text-left focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 -mx-2"
                >
                  <h1 className="text-2xl font-bold leading-tight tracking-tight hover:text-[#00A9CE] transition-colors cursor-pointer">
                    Space Biology Knowledge Engine
                  </h1>
                </button>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs font-medium text-[#00A9CE]">
                    NASA Space Apps Challenge 2025
                  </p>
                  <div className="h-3 w-px bg-white/30" />
                  <StatsWidget />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Persona Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="group relative overflow-hidden bg-white/10 border-2 border-white/20 hover:border-white/40 hover:bg-white/20 text-white px-6 py-3 h-auto backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A9CE]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <CurrentIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs font-medium text-white/70">Current Role</div>
                    <div className="text-sm font-bold">{currentConfig.name}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-72 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl"
            >
              <DropdownMenuLabel className="text-base font-bold text-gray-800">
                Switch Persona
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              {Object.values(personaConfigs).map((persona) => {
                const Icon = persona.icon;
                return (
                  <DropdownMenuItem
                    key={persona.id}
                    onClick={() => onPersonaChange(persona.id as Persona)}
                    className={`
                      flex items-start gap-3 px-4 py-3 cursor-pointer
                      ${currentPersona === persona.id ? 'bg-[#0B3D91]/10' : ''}
                      hover:bg-[#0B3D91]/5 transition-colors
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mt-1
                      ${currentPersona === persona.id 
                        ? 'bg-gradient-to-br from-[#0B3D91] to-[#1a5cc4] text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{persona.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{persona.description}</div>
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
