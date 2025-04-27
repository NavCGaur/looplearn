import React from "react";
import { Button } from "@/components/ui/button";

interface VoiceSelectionProps {
  voice: "male" | "female";
  setVoice: (voice: "male" | "female") => void;
}

const VoiceSelection: React.FC<VoiceSelectionProps> = ({ voice, setVoice }) => (
  <div className="space-y-4 animate-fade-in flex flex-col flex-1 justify-around">
    <div className="flex gap-4 justify-center my-4">
      <Button
        variant={voice === "male" ? "default" : "outline"}
        onClick={() => setVoice("male")}
        className="flex flex-col items-center justify-center min-w-[110px] max-w-[130px] !h-24 rounded-xl px-1 text-base font-medium overflow-hidden whitespace-nowrap"
      >
        <span
          className="mb-1"
          role="img"
          aria-label="male voice"
          style={{ fontSize: 28 }}
        >🔊</span>
        <span className="truncate w-full">Male</span>
      </Button>
      <Button
        variant={voice === "female" ? "default" : "outline"}
        onClick={() => setVoice("female")}
        className="flex flex-col items-center justify-center min-w-[110px] max-w-[130px] !h-24 rounded-xl px-1 text-base font-medium overflow-hidden whitespace-nowrap"
      >
        <span
          className="mb-1"
          role="img"
          aria-label="female voice"
          style={{ fontSize: 28 }}
        >🔊</span>
        <span className="truncate w-full">Female</span>
      </Button>
    </div>
    <p className="text-muted-foreground text-center text-sm">
      Select which voice you want to practice with
    </p>
  </div>
);

export default VoiceSelection;