import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Layout from '@/components/layout/Layout';
import type { Persona } from '@/types';

function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handlePersonaChange = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  if (!selectedPersona) {
    return <LandingPage onSelectPersona={handlePersonaSelect} />;
  }

  return (
    <Layout 
      currentPersona={selectedPersona} 
      onPersonaChange={handlePersonaChange}
    />
  );
}

export default App;
