
import React from "react";
import { Button } from "@/components/ui/button";

const ComparePhase: React.FC = () => (
  <div className="space-y-5 animate-fade-in flex flex-col justify-center flex-1">
    {/* <h2 ...>Compare Your Speaking</h2> removed */}
    <div className="flex gap-4 justify-center">
      {/* Increase min-w and px for buttons so text fits better */}
      <Button variant="secondary" className="px-6 py-2 flex flex-col items-center rounded-lg min-w-[140px]">
        <span role="img" aria-label="original" className="mb-1" style={{fontSize:26}}>🔈</span>
        <span className="text-sm font-medium">Hear Original</span>
      </Button>
      <Button variant="default" className="px-6 py-2 flex flex-col items-center rounded-lg min-w-[140px]">
        <span role="img" aria-label="yours" className="mb-1" style={{fontSize:26}}>🎧</span>
        <span className="text-sm font-medium">Hear Your Version</span>
      </Button>
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Compare your pronunciation with the native speaker
    </p>
  </div>
);

export default ComparePhase;
