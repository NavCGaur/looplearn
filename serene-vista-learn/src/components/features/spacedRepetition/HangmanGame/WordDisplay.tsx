import React from "react";

const WordDisplay = ({ word, guessedLetters }) => {
  return (
    <div className="flex justify-center items-center mb-2 md:mb-4 min-h-[60px] sm:min-h-[80px] bg-[#FFDEE2] rounded-xl p-3 sm:p-4 shadow-md">
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {word.split("").map((letter, index) => (
          <div
            key={index}
            className={`w-6 sm:w-8 h-8 sm:h-10 flex items-center justify-center ${
              guessedLetters.includes(letter) ? "bounce-letter" : ""
            }`}
          >
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-langlearn-dark-blue">
              {guessedLetters.includes(letter) ? letter : "_"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordDisplay;