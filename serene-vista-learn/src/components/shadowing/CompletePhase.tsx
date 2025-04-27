
import React from "react";
import { Button } from "@/components/ui/button";

interface CompletePhaseProps {
  handleNewPhrase: () => void;
}

const CompletePhase: React.FC<CompletePhaseProps> = ({
  handleNewPhrase
}) => (
  <div className="space-y-5 animate-fade-in flex flex-col justify-center flex-1">
    {/* <h2 ...>Well Done!</h2> removed */}
    <p className="text-base text-green-700 font-semibold text-center">
      Practice until you match the native pronunciation or feel satisfied. <br />
      Then choose a new phrase to keep improving!
    </p>
    <div className="flex justify-center gap-3">
      <Button variant="outline" onClick={handleNewPhrase}>
        <span className="mr-2" role="img" aria-label="back">⏮️</span>
        Choose Another
      </Button>
      <Button onClick={handleNewPhrase} >
        <span className="mr-2" role="img" aria-label="next">⏭️</span>
        Next Practice
      </Button>
    </div>
  </div>
);

export default CompletePhase;
