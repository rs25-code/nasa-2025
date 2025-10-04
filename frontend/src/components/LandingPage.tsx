import { personaConfigs } from '@/lib/personas';
import type { Persona } from '@/types';

interface LandingPageProps {
  onSelectPersona: (persona: Persona) => void;
}

export default function LandingPage({ onSelectPersona }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nasa-blue via-slate-900 to-black flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            NASA Space Biology
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-nasa-teal mb-6">
            Knowledge Engine
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore 608 space biology research papers with AI-powered insights
          </p>
        </div>

        {/* Persona Selection */}
        <div className="text-center mb-12">
          <h3 className="text-2xl text-white mb-3">Select Your Role</h3>
          <p className="text-gray-400">Choose how you want to explore the research</p>
        </div>

        {/* Persona Bubbles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(personaConfigs).map((persona) => {
            const Icon = persona.icon;
            return (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona.id)}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Icon Circle */}
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center mb-6 group-hover:from-white/30 group-hover:to-white/10 transition-all duration-300">
                  <Icon className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h4 className="text-2xl font-bold text-white mb-3">
                  {persona.name}
                </h4>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {persona.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-nasa-teal/0 to-nasa-blue/0 group-hover:from-nasa-teal/10 group-hover:to-nasa-blue/10 transition-all duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            NASA Space Apps Challenge 2025
          </p>
        </div>
      </div>
    </div>
  );
}
