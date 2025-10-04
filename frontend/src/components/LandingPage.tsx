import { personaConfigs } from '@/lib/personas';
import type { Persona } from '@/types';
import { Rocket } from 'lucide-react';

interface LandingPageProps {
  onSelectPersona: (persona: Persona) => void;
}

export default function LandingPage({ onSelectPersona }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91] via-slate-900 to-black">
        {/* Animated overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00A9CE] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FC3D21] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-7xl w-full">
          {/* Header with enhanced styling */}
          <div className="text-center mb-20 animate-in">
            <div className="inline-flex items-center justify-center mb-6">
              <Rocket className="w-16 h-16 text-[#00A9CE] animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
              NASA Space Biology
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-8 bg-gradient-to-r from-[#00A9CE] to-[#FC3D21] bg-clip-text text-transparent">
              Knowledge Engine
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore 608 space biology research papers with AI-powered insights
            </p>
          </div>

          {/* Persona Selection with enhanced cards */}
          <div className="text-center mb-16 animate-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-3xl font-bold text-white mb-4">Select Your Role</h3>
            <p className="text-lg text-gray-400">Choose how you want to explore the research</p>
          </div>

          {/* Enhanced Persona Bubbles with staggered animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.values(personaConfigs).map((persona, index) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelectPersona(persona.id)}
                  className="group relative overflow-hidden rounded-3xl p-10 border-2 border-white/20 hover:border-white/50 transition-all duration-500 hover:scale-105 animate-in"
                  style={{ 
                    animationDelay: `${0.2 + index * 0.1}s`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A9CE]/20 to-[#0B3D91]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Glowing effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00A9CE] to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FC3D21] to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Circle with enhanced styling */}
                    <div className="mx-auto w-28 h-28 rounded-full mb-8 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500"
                         style={{
                           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
                           boxShadow: '0 8px 32px rgba(0, 169, 206, 0.3)'
                         }}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00A9CE]/30 to-[#0B3D91]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className="w-14 h-14 text-white relative z-10" />
                    </div>

                    {/* Title */}
                    <h4 className="text-3xl font-bold text-white mb-4 group-hover:text-[#00A9CE] transition-colors duration-300">
                      {persona.name}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-300 text-base leading-relaxed group-hover:text-white transition-colors duration-300">
                      {persona.description}
                    </p>

                    {/* Call to action hint */}
                    <div className="mt-6 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm text-[#00A9CE] font-semibold">Click to explore →</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with enhanced styling */}
          <div className="text-center mt-20 animate-in" style={{ animationDelay: '0.5s' }}>
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
