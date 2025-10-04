import { Microscope, TrendingUp, Rocket } from 'lucide-react';
import type { Persona } from '@/types';

export interface PersonaConfig {
  id: Persona;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  sampleQueries: string[];
}

export const personaConfigs: Record<Persona, PersonaConfig> = {
  scientist: {
    id: 'scientist',
    name: 'Scientist',
    icon: Microscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    description: 'Deep research, methodology validation, finding contradictions',
    sampleQueries: [
      'What are the molecular mechanisms of muscle atrophy in microgravity?',
      'How does space radiation affect DNA repair mechanisms?',
      'Which organisms show significant adaptations to microgravity?',
      'What are the effects of cosmic radiation on plant growth?',
    ],
  },
  investor: {
    id: 'investor',
    name: 'Investment Manager',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    description: 'Identify commercial opportunities, assess technology readiness, spot trends',
    sampleQueries: [
      'What are emerging commercial opportunities in space biology?',
      'Which research areas have shown growth in recent years?',
      'What technologies have terrestrial applications?',
      'What are the investment opportunities in space agriculture?',
    ],
  },
  architect: {
    id: 'architect',
    name: 'Mission Architect',
    icon: Rocket,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    description: 'Plan missions, assess risks, identify technical constraints',
    sampleQueries: [
      'What are critical biological constraints for long-duration missions?',
      'Which countermeasures are most effective against space health issues?',
      'What life support requirements emerge from plant research?',
      'What are the radiation exposure limits for Mars missions?',
    ],
  },
};
