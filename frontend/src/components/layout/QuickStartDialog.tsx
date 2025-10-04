import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Search, TrendingUp, Target } from 'lucide-react';

export default function QuickStartDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
    if (!hasSeenQuickStart) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenQuickStart', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#0B3D91] to-[#1a5cc4] rounded-xl shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-gray-800">
              Welcome to the Space Biology Knowledge Engine!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 mt-4 leading-relaxed">
            Explore 608 NASA space biology research papers with AI-powered insights tailored to your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 mb-4">Get Started:</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Search className="w-5 h-5 text-[#0B3D91]" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">Search Tab</h5>
                <p className="text-sm text-gray-600">
                  Use semantic search to find relevant research papers with advanced filters
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-[#0B3D91]" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">Trends Tab</h5>
                <p className="text-sm text-gray-600">
                  Visualize research patterns, organisms studied, and emerging areas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Target className="w-5 h-5 text-[#0B3D91]" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">Gap Analysis Tab</h5>
                <p className="text-sm text-gray-600">
                  Discover under-researched areas and strategic opportunities
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#0B3D91]/5 to-[#00A9CE]/5 rounded-xl border-2 border-[#0B3D91]/20">
            <p className="text-sm text-gray-700 font-medium">
              💡 <strong>Pro Tip:</strong> Switch between personas (Scientist, Investor, Architect) in the header to get tailored insights for your role!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-[#0B3D91] to-[#1a5cc4] hover:from-[#1a5cc4] hover:to-[#00A9CE] text-white shadow-lg hover:shadow-xl"
          >
            Got it, let's explore! 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
