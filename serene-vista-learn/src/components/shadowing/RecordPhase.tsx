
import React from "react";
import { Button } from "@/components/ui/button";

interface RecordPhaseProps {
  recording: boolean;
  setRecording: (r: boolean) => void;
  setPhase: (phase: "compare") => void;
}

const RecordPhase: React.FC<RecordPhaseProps> = ({
  recording, setRecording, setPhase
}) => (
  <div className="space-y-5 animate-fade-in flex flex-col justify-center flex-1">
    {/* <h2 ...>Your Turn</h2> removed */}
    <div className="flex flex-col items-center justify-center">
      <Button
        variant={recording ? "destructive" : "default"}
        className="px-8 py-3 rounded-full flex items-center gap-2 w-[220px] h-16 text-base"
        onClick={() => {
          setRecording(!recording);
          if (!recording) setTimeout(() => { setRecording(false); setPhase("compare"); }, 1500);
        }}
      >
        <span
          className={recording ? "animate-pulse text-red-500" : "text-blue-600"}
          role="img"
          aria-label="mic"
          style={{ fontSize: 26 }}
        >🎙️</span>
        {recording ? (
          <span className="ml-2 font-semibold">Recording...</span>
        ) : (
          <span className="ml-2">Record Your Voice</span>
        )}
      </Button>
      <div className="h-4" />
      <span className="text-sm text-muted-foreground text-center">Press and speak clearly when ready</span>
    </div>
  </div>
);

export default RecordPhase;
