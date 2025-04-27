import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const COMMON_PHRASES = [
  { category: "Greetings", phrases: ["Good morning", "Hello!", "How are you?"] },
  { category: "Basics", phrases: ["Thank you", "Excuse me", "Sorry", "Please"] },
  { category: "Travel", phrases: ["Where is the station?", "I need help", "How much is this?"] },
];

interface PracticeData {
  phrase: string;
  voice: "male" | "female";
}

interface IntegratedPracticeComponentProps {
  onComplete: (data: PracticeData) => void;
  onPhraseSelected?: (phrase: string) => void;
}

const IntegratedPracticeComponent: React.FC<IntegratedPracticeComponentProps> = ({ 
  onComplete, 
  onPhraseSelected = () => {}
}) => {
  const [voice, setVoice] = useState<"male" | "female">("female");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [phrase, setPhrase] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<"voice" | "phrase" | "listen">("voice");

  const handleSelectVoice = (selectedVoice: "male" | "female") => {
    setVoice(selectedVoice);
    setCurrentStep("phrase");
  };

  const handlePickPhrase = (p: string) => {
    setPhrase(p);
    onPhraseSelected(p);
    setCurrentStep("listen");
    setSelectedCategory(null); // Close phrase selection after choosing
  };

  const handleCustomPhraseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phrase.trim()) {
      onPhraseSelected(phrase);
      setCurrentStep("listen");
    }
  };

  const playAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const handleStartRecording = () => {
    onComplete({ phrase, voice });
  };

  // Edit icon component for section headers
  const EditIcon = ({ onClick, disabled = false }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`ml-2 p-1 rounded-full focus:outline-none ${
        disabled ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'
      }`}
      aria-label="Edit section"
      title="Edit this section"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
      </svg>
    </button>
  );

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Voice Selection Section */}
      <section className="p-5 border-b border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex justify-between items-center">
          <span>
            1. Choose Voice
            {currentStep !== "voice" && <span className="ml-2 text-sm text-green-600">✓</span>}
          </span>
          {currentStep !== "voice" && <EditIcon onClick={() => setCurrentStep("voice")} />}
        </h2>
        
        {currentStep === "voice" ? (
          <div className="flex gap-3 justify-center my-4">
            <Button
              variant={voice === "male" ? "default" : "outline"}
              onClick={() => handleSelectVoice("male")}
              className="flex flex-col items-center justify-center w-32 h-16 rounded-xl"
            >
              <span className="text-xl mb-1" role="img" aria-label="male voice">👨</span>
              <span>Male</span>
            </Button>
            
            <Button
              variant={voice === "female" ? "default" : "outline"}
              onClick={() => handleSelectVoice("female")}
              className="flex flex-col items-center justify-center w-32 h-16 rounded-xl"
            >
              <span className="text-xl mb-1" role="img" aria-label="female voice">👩</span>
              <span>Female</span>
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 text-blue-700">
            Selected Voice: <span className="font-medium">{voice === "male" ? "Male" : "Female"}</span>
          </div>
        )}
      </section>

      {/* Phrase Selection Section */}
      <section className="p-5 border-b border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex justify-between items-center">
          <span>
            2. Select Phrase
            {currentStep === "listen" && <span className="ml-2 text-sm text-green-600">✓</span>}
          </span>
          {currentStep === "listen" && <EditIcon onClick={() => setCurrentStep("phrase")} />}
        </h2>
        
        {currentStep === "phrase" ? (
          <>
            <form onSubmit={handleCustomPhraseSubmit}>
              <Input
                placeholder="Type your phrase here (e.g. 'Good morning')"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                className="mb-4"
              />
              {phrase.trim() && (
                <div className="flex justify-end mb-4">
                  <Button type="submit" size="sm">
                    Use This Phrase
                  </Button>
                </div>
              )}
            </form>

            <div className="text-sm text-muted-foreground text-center py-1">
              Or choose from common phrases:
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {COMMON_PHRASES.map(({ category, phrases }) => (
                <Collapsible key={category} open={selectedCategory === category}>
                  <CollapsibleTrigger
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className="flex items-center justify-between w-full py-2 px-3 rounded bg-blue-50 hover:bg-blue-100 font-medium text-sm"
                  >
                    <span>{category}</span>
                    <span>{selectedCategory === category ? "−" : "+"}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-2 py-2 flex flex-wrap gap-2">
                    {phrases.map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant="secondary"
                        className="rounded-full text-xs"
                        onClick={() => handlePickPhrase(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </>
        ) : currentStep === "listen" ? (
          <div className="text-center py-2 text-blue-700">
            Selected Phrase: <span className="font-medium">"{phrase}"</span>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-400">
            Select a voice first
          </div>
        )}
      </section>

      {/* Listen Section */}
      <section className="p-5">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          3. Listen & Practice
        </h2>
        
        {currentStep === "listen" ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-5">
            <div className="text-lg font-medium text-center max-w-xs break-words">
              "{phrase}"
            </div>
            
            <div className="text-sm font-medium px-3 py-1 bg-blue-100 rounded-full text-blue-700 mb-2">
              {voice === "male" ? "Male" : "Female"} Voice
            </div>
            
            <Button
              size="lg"
              variant="secondary"
              className={`px-6 py-4 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
              onClick={playAudio}
              disabled={isPlaying}
            >
              <span className="text-xl mr-2" role="img" aria-label="play">
                {isPlaying ? '🔊' : '▶️'}
              </span>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              Listen carefully to the pronunciation and intonation
            </div>
            
            <Button 
              variant="default" 
              className="mt-4" 
              onClick={handleStartRecording}
              disabled={isPlaying}
            >
              Record My Voice
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {currentStep === "voice" ? "Complete steps 1 and 2 first" : "Select a phrase first"}
          </div>
        )}
      </section>
      
      {/* Bottom navigation is now optional since we have edit icons */}
      <div className="flex justify-end items-center p-4 border-t border-gray-100">
        {currentStep === "phrase" && phrase.trim() !== "" && (
          <Button onClick={() => setCurrentStep("listen")} size="sm">
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default IntegratedPracticeComponent;