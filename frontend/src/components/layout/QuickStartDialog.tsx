import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Microscope, TrendingUp, Target } from 'lucide-react';

export default function QuickStartDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenQuickStart');
    if (!hasSeenGuide) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenQuickStart', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Rocket className="w-6 h-6 text-nasa-blue" />
            Welcome to Space Biology Knowledge Engine
          </DialogTitle>
          <DialogDescription className="text-base">
            Your AI-powered research assistant for space biology
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Microscope className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Search Tab</h4>
                <p className="text-sm text-gray-600">
                  Semantic search across 608 research papers with smart filtering by year, organism, and section
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Trends Tab</h4>
                <p className="text-sm text-gray-600">
                  Visualize research patterns, emerging areas, and topic distributions over time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Target className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Gap Analysis Tab</h4>
                <p className="text-sm text-gray-600">
                  Discover under-researched areas and future research opportunities
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">
              <strong>Pro tip:</strong> Switch personas (Scientist, Investor, Mission Architect) using the dropdown in the top-right to get tailored views and insights!
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose} className="bg-nasa-blue hover:bg-nasa-blue/90">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
