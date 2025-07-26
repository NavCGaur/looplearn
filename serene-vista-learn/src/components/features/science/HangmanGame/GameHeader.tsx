import React from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

const GameHeader = ({ onReset }) => {
  return (
    <>
      <Button 
        onClick={onReset} 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10 bg-langlearn-light-blue text-white hover:bg-langlearn-blue"
        title="Reset Game"
      >
        <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <CardHeader className="bg-gradient-to-r from-langlearn-light-blue to-langlearn-blue text-white p-4">
        <CardTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold">Hangman Game</CardTitle>
      </CardHeader>
    </>
  );
};

export default GameHeader;