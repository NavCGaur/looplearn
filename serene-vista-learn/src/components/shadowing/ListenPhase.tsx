
import React from "react";
import { Button } from "@/components/ui/button";

interface ListenPhaseProps {
  phrase: string;
  voice: "male" | "female";
  setPhase: (phase: "record") => void;
}

const ListenPhase: React.FC<ListenPhaseProps> = ({ phrase, voice, setPhase }) => (
  <div className="space-y-5 animate-fade-in flex flex-col justify-center flex-1">
    {/* <h2 ...>Listen Carefully</h2> removed */}
    <div className="text-center">
      <Button
        variant="secondary"
        className="px-6 py-3 rounded-lg animate-pulse"
        onClick={() => setTimeout(() => setPhase("record"), 1000)}
      >
        <span role="img" aria-label="play">▶️</span>
        Play Native Audio ({voice === "male" ? "Male" : "Female"})
      </Button>
      <div className="mt-2 text-base font-medium break-words max-w-xs mx-auto">
        {phrase || <span className="italic text-sm">No phrase</span>}
      </div>
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Listen carefully to how the speaker says this phrase
    </p>
  </div>
);

export default ListenPhase;
