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
}

export default function Header({ currentPersona, onPersonaChange }: HeaderProps) {
  const currentConfig = personaConfigs[currentPersona];
  const CurrentIcon = currentConfig.icon;

  return (
    <header className="bg-gradient-to-r from-[#0B3D91] via-[#1a5cc4] to-[#0B3D91] text-white shadow-2xl sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title with enhanced styling */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Animated logo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FC3D21] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#FC3D21] to-[#fc6d21] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
              </div>
              
              {/* Title section */}
              <div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight hover:text-[#00A9CE] transition-colors cursor-default">
                  Space Biology Knowledge Engine
                </h1>
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
                    <div className="font-semibold text-sm">{currentConfig.name}</div>
                    <div className="text-xs text-white/70">{currentConfig.description.split(',')[0]}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-md border-gray-200 shadow-2xl">
              <DropdownMenuLabel className="text-base font-semibold text-gray-700">
                Switch Your Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(personaConfigs).map((persona) => {
                const Icon = persona.icon;
                const isActive = currentPersona === persona.id;
                return (
                  <DropdownMenuItem
                    key={persona.id}
                    onClick={() => onPersonaChange(persona.id)}
                    className={`cursor-pointer p-4 transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#0B3D91]/10 to-[#00A9CE]/10 border-l-4 border-[#00A9CE]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-[#00A9CE]/20' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-[#0B3D91]' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          isActive ? 'text-[#0B3D91]' : 'text-gray-700'
                        }`}>
                          {persona.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {persona.description.split(',')[0]}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-[#00A9CE] rounded-full mt-2" />
                      )}
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
