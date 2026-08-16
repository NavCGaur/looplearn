import { useState, useEffect, useCallback } from "react";

export type GameStatus = "playing" | "won" | "lost";
export type MascotMood = "neutral" | "happy" | "worried" | "excited" | "thoughtful";

interface GameWord {
    word: string;
    category: string;
    hint: string;
}

const STATIC_WORDS: GameWord[] = [
    { word: "HAPPY", category: "Vocabulary", hint: "Opposite of sad" },
    { word: "SAD", category: "Vocabulary", hint: "Opposite of happy" },
    { word: "HUNGRY", category: "Vocabulary", hint: "Need to eat food" },
    { word: "TIRED", category: "Vocabulary", hint: "Need to sleep / Rest" },
    { word: "STUDENT", category: "Vocabulary", hint: "One who studies in class" },
    { word: "BROTHER", category: "Vocabulary", hint: "Male sibling" },
    { word: "SISTER", category: "Vocabulary", hint: "Female sibling" },
    { word: "FRIEND", category: "Vocabulary", hint: "A close companion" },
];

const MAX_WRONG_ATTEMPTS = 6;
const FUEL_STEP = 15;

export const useSpaceHangman = () => {
    const [words, setWords] = useState<GameWord[]>(STATIC_WORDS);
    const [wordIndex, setWordIndex] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [fuelLevel, setFuelLevel] = useState(0);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [mascotMood, setMascotMood] = useState<MascotMood>("neutral");
    const [score, setScore] = useState(0);

    // Fetch active vocabulary from DB endpoint
    useEffect(() => {
        const fetchActiveVocab = async () => {
            try {
                const res = await fetch('/api/student/active-vocabulary');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.vocabulary && data.vocabulary.length > 0) {
                        const mapped: GameWord[] = data.vocabulary.map((w: string) => ({
                            word: w.trim().toUpperCase(),
                            category: `Week ${data.week_number} Vocab`,
                            hint: `Complete the week's practice word: "${w.trim().toLowerCase()}"`
                        }));
                        setWords(mapped);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dynamic vocabulary list for Space Hangman:", err);
            }
        };
        fetchActiveVocab();
    }, []);

    const activeWord = words[wordIndex] || STATIC_WORDS[0];
    const { word, category, hint } = activeWord;

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
        setWordIndex((i) => (i + 1) % words.length);
        resetGame();
    }, [resetGame, words.length]);

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
