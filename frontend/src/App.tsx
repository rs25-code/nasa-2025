import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Layout from './components/layout/Layout';
import type { Persona } from './types';

function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    console.log('Persona selected:', persona);
    setSelectedPersona(persona);
  };

  const handlePersonaChange = (persona: Persona) => {
    console.log('Persona changed:', persona);
    setSelectedPersona(persona);
  };

  const handleBackToLanding = () => {
    console.log('Back to landing');
    setSelectedPersona(null);
  };

  if (!selectedPersona) {
    return <LandingPage onSelectPersona={handlePersonaSelect} />;
  }

  console.log('Rendering Layout with persona:', selectedPersona);

  return (
    <Layout
      currentPersona={selectedPersona}
      onPersonaChange={handlePersonaChange}
      onBackToLanding={handleBackToLanding}
    />
  );
}

export default App;
