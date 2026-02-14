import { useState, useCallback } from "react";

export type GameStatus = "playing" | "won" | "lost";
export type MascotMood = "neutral" | "happy" | "worried" | "excited" | "thoughtful";

const WORDS = [
    { word: "GRAVITY", category: "Physics", hint: "What keeps us grounded" },
    { word: "PLANET", category: "Space", hint: "Earth is one of these" },
    { word: "OXYGEN", category: "Chemistry", hint: "We breathe this gas" },
    { word: "NEBULA", category: "Space", hint: "A cloud of gas in space" },
    { word: "PHOTON", category: "Physics", hint: "A particle of light" },
    { word: "QUASAR", category: "Space", hint: "An extremely bright galactic nucleus" },
];

const MAX_WRONG_ATTEMPTS = 6;
const FUEL_STEP = 15;

export const useSpaceHangman = () => {
    const [wordIndex, setWordIndex] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [fuelLevel, setFuelLevel] = useState(0);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [mascotMood, setMascotMood] = useState<MascotMood>("neutral");
    const [score, setScore] = useState(0);

    const { word, category, hint } = WORDS[wordIndex];

    const guessLetter = useCallback(
        (letter: string) => {
            if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;

            const newGuessed = [...guessedLetters, letter];
            setGuessedLetters(newGuessed);

            if (word.includes(letter)) {
                const newFuel = Math.min(100, fuelLevel + FUEL_STEP);
                setFuelLevel(newFuel);
                setMascotMood("happy");
                setScore((s) => s + 10);

                // Check win: all letters revealed OR fuel >= 100
                const allRevealed = word.split("").every((l) => newGuessed.includes(l));
                if (allRevealed || newFuel >= 100) {
                    setFuelLevel(100);
                    setGameStatus("won");
                    setMascotMood("excited");
                    setScore((s) => s + 50);
                }
            } else {
                const newWrong = wrongAttempts + 1;
                setWrongAttempts(newWrong);
                setFuelLevel((f) => Math.max(0, f - FUEL_STEP));
                setMascotMood("worried");

                if (newWrong >= MAX_WRONG_ATTEMPTS) {
                    setGameStatus("lost");
                    setMascotMood("thoughtful");
                }
            }
        },
        [gameStatus, guessedLetters, word, fuelLevel, wrongAttempts]
    );

    const resetGame = useCallback(() => {
        setGuessedLetters([]);
        setFuelLevel(0);
        setWrongAttempts(0);
        setGameStatus("playing");
        setMascotMood("neutral");
    }, []);

    const nextMission = useCallback(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        resetGame();
    }, [resetGame]);

    return {
        word,
        category,
        hint,
        guessedLetters,
        fuelLevel,
        wrongAttempts,
        maxWrongAttempts: MAX_WRONG_ATTEMPTS,
        gameStatus,
        mascotMood,
        score,
        guessLetter,
        resetGame,
        nextMission,
    };
};
