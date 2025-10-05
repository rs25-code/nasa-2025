import { personaConfigs } from '@/lib/personas';
import type { Persona } from '@/types';
import { Rocket } from 'lucide-react';

interface LandingPageProps {
  onSelectPersona: (persona: Persona) => void;
}

export default function LandingPage({ onSelectPersona }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0B3D91] via-[#1a5cc4] to-[#0B3D91]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00A9CE]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC3D21]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with fixed padding */}
          <div className="text-center mb-20 pb-8">
            {/* Rocket Icon */}
            <div className="flex justify-center mb-8 animate-in" style={{ animationDelay: '0s' }}>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#00A9CE] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#00A9CE] to-[#0B3D91] rounded-full flex items-center justify-center shadow-2xl">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Title with extra bottom padding to prevent cutoff */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight animate-in pb-2" style={{ animationDelay: '0.1s' }}>
              NASA Space Biology
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 pb-4 leading-tight bg-gradient-to-r from-[#00A9CE] to-[#FC3D21] bg-clip-text text-transparent animate-in" style={{ animationDelay: '0.2s' }}>
              Knowledge Engine
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-in" style={{ animationDelay: '0.3s' }}>
              Explore 608 space biology research papers with AI-powered insights
            </p>
          </div>

          {/* Persona Selection */}
          <div className="text-center mb-16 animate-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-3xl font-bold text-white mb-4">Select Your Role</h3>
            <p className="text-lg text-gray-400">Choose how you want to explore the research</p>
          </div>

          {/* Persona Bubbles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.values(personaConfigs).map((persona, index) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelectPersona(persona.id)}
                  className="group relative overflow-hidden rounded-3xl p-10 border-2 border-white/20 hover:border-white/50 transition-all duration-500 hover:scale-105 animate-in"
                  style={{ 
                    animationDelay: `${0.5 + index * 0.1}s`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A9CE]/20 to-[#FC3D21]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon with enhanced styling */}
                    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#00A9CE]/20 to-[#0B3D91]/20 group-hover:from-[#00A9CE]/30 group-hover:to-[#0B3D91]/30 transition-all duration-300 border-2 border-white/10 group-hover:border-white/30">
                      <Icon className="w-12 h-12 text-[#00A9CE] group-hover:text-white transition-colors duration-300" />
                    </div>

                    {/* Title */}
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00A9CE] transition-colors duration-300">
                      {persona.name}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-300 text-base leading-relaxed group-hover:text-white transition-colors duration-300">
                      {persona.description}
                    </p>

                    {/* Call to action */}
                    <div className="mt-6 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm text-[#00A9CE] font-semibold">Click to explore →</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-20 animate-in" style={{ animationDelay: '0.8s' }}>
            <div className="inline-block px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-gray-400 text-sm font-medium">
                NASA Space Apps Challenge 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-2 h-2 bg-[#00A9CE] rounded-full animate-pulse" />
      <div className="absolute bottom-20 left-20 w-3 h-3 bg-[#FC3D21] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 left-10 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}
