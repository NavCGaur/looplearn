import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VocabWord } from '@/data/mockVocabData';

interface VocabDetailModalProps {
  word: VocabWord | null;
  open: boolean;
  onClose: () => void;
}

const VocabDetailModal = ({ word, open, onClose }: VocabDetailModalProps) => {
  if (!word) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{word.word}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={word.mastered ? "default" : "secondary"}>
              {word.mastered ? "Mastered" : "Learning"}
            </Badge>
            <Badge variant={
              word.difficulty === 'Easy' ? "default" :
              word.difficulty === 'Medium' ? "secondary" : "destructive"
            }>
              {word.difficulty}
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Definition</h4>
            <p>{word.definition}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Examples</h4>
            <ul className="list-disc pl-5 space-y-2">
              {word.examples.map((example, index) => (
                <li key={index}>{example}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Added: {new Date(word.dateAdded).toLocaleDateString()}</p>
              <p>Last Review: {new Date(word.lastReviewDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p>Times Reviewed: {word.timesReviewed}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VocabDetailModal;