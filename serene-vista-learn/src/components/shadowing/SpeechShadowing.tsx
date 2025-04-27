import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import IntegratedPracticeComponent from "./integratedPracticeComponent";
import RecordPhase from "./RecordPhase";
import ComparePhase from "./ComparePhase";
import CompletePhase from "./CompletePhase";

interface PracticeData {
  phrase: string;
  voice: "male" | "female";
}

export const SpeechShadowing: React.FC = () => {
  const [phase, setPhase] = useState<"setup" | "record" | "compare" | "complete">("setup");
  const [practiceData, setPracticeData] = useState<PracticeData>({
    phrase: "",
    voice: "female"
  });
  const [recording, setRecording] = useState(false);

  const handlePracticeComplete = (data: PracticeData) => {
    setPracticeData(data);
    setPhase("record");
  };

  const handleNewPractice = () => {
    setPhase("setup");
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="flex items-center justify-center mb-6">
        <span role="img" aria-label="headphones" className="text-blue-400 text-2xl">🎧</span>
        <span className="ml-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-900">
          Speech Shadowing Practice
        </span>
        <span className="ml-3 px-2 py-1 rounded bg-blue-200 text-xs font-bold uppercase text-blue-700 align-middle">
          beta
        </span>
      </div>
      
      <div className="w-full max-w-md">
        {phase === "setup" && (
          <IntegratedPracticeComponent 
            onComplete={handlePracticeComplete}
          />
        )}
        
        {phase === "record" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
              <h2 className="text-lg font-semibold text-blue-900">Record Your Voice</h2>
              <p className="text-sm text-blue-700 mt-1">"{practiceData.phrase}"</p>
            </div>
            <div className="p-6">
              <RecordPhase 
                recording={recording} 
                setRecording={setRecording}
                setPhase={() => setPhase("compare")}
              />
            </div>
            <div className="flex justify-between items-end p-4 pt-0 border-t border-gray-100">
              <Button variant="outline" onClick={handleNewPractice} size="sm">
                <span className="mr-1" role="img" aria-label="back">⏮️</span>
                Start Over
              </Button>
              <Button
                onClick={() => setPhase("compare")}
                size="sm"
                disabled={recording}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {phase === "compare" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
              <h2 className="text-lg font-semibold text-blue-900">Compare Your Pronunciation</h2>
              <p className="text-sm text-blue-700 mt-1">"{practiceData.phrase}"</p>
            </div>
            <div className="p-6">
              <ComparePhase />
            </div>
            <div className="flex justify-between items-end p-4 pt-0 border-t border-gray-100">
              <Button variant="outline" onClick={handleNewPractice} size="sm">
                <span className="mr-1" role="img" aria-label="back">⏮️</span>
                Start Over
              </Button>
              <Button onClick={() => setPhase("complete")} size="sm">
                Next
              </Button>
            </div>
          </div>
        )}
        
        {phase === "complete" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
              <h2 className="text-lg font-semibold text-blue-900">Practice Complete</h2>
            </div>
            <div className="p-6">
              <CompletePhase handleNewPhrase={handleNewPractice} />
            </div>
            <div className="flex justify-end items-end p-4 pt-0 border-t border-gray-100">
              <Button onClick={handleNewPractice} size="sm">
                Practice Another Phrase
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechShadowing;