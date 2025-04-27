
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface PhraseSelectionProps {
  phrase: string;
  setPhrase: (p: string) => void;
  COMMON_PHRASES: { category: string; phrases: string[] }[];
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  handlePickPhrase: (phrase: string) => void;
}

const PhraseSelection: React.FC<PhraseSelectionProps> = ({
  phrase, setPhrase, COMMON_PHRASES, selectedCategory, setSelectedCategory, handlePickPhrase
}) => (
  <div className="space-y-5 animate-fade-in flex flex-col flex-1 justify-around">
    {/* <h2 ...>Choose Your Phrase</h2> removed */}
    <Input
      placeholder="Type your phrase here (e.g. 'Good morning')"
      value={phrase}
      onChange={(e) => setPhrase(e.target.value)}
      className="mb-2"
    />
    <p className="text-xs text-muted-foreground text-center">Or choose from common phrases:</p>
    <div className="mb-1">
      {COMMON_PHRASES.map(({ category, phrases }) => (
        <Collapsible key={category} open={selectedCategory === category}>
          <CollapsibleTrigger
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            className="flex items-center justify-between w-full py-2 px-3 rounded bg-blue-50 hover:bg-blue-100 font-medium"
          >
            <span>{category}</span>
            <span>{selectedCategory === category ? "–" : "+"}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 py-2 flex flex-wrap gap-2">
            {phrases.map((p) => (
              <Button
                key={p}
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() => handlePickPhrase(p)}
              >
                {p}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Pick or type what you want to practice
    </p>
  </div>
);

export default PhraseSelection;
