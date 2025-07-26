export type QuizType = 'mcq' | 'fillBlank';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  word: string;
  definition: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: '1',
    type: 'mcq',
    question: "Which word means 'very happy'?",
    word: 'joyful',
    definition: 'Feeling or showing great happiness',
    options: ['joyful', 'sad', 'angry', 'tired'],
    correctAnswer: 'joyful',
    difficulty: 'easy',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    type: 'mcq',
    question: "Which word means 'very big'?",
    word: 'enormous',
    definition: 'Extremely large',
    options: ['tiny', 'enormous', 'average', 'small'],
    correctAnswer: 'enormous',
    difficulty: 'easy'
  },
  {
    id: '3',
    type: 'fillBlank',
    question: "The dinosaur was so big, it was ________.",
    word: 'enormous',
    definition: 'Extremely large',
    correctAnswer: 'enormous',
    difficulty: 'medium'
  },
  {
    id: '4',
    type: 'fillBlank',
    question: "She was so ________ when she got a new puppy.",
    word: 'joyful',
    definition: 'Feeling or showing great happiness',
    correctAnswer: 'joyful',
    difficulty: 'medium'
  },
  {
    id: '5',
    type: 'mcq',
    question: "Which word means 'to move quickly'?",
    word: 'dash',
    definition: 'To run or move very quickly',
    options: ['crawl', 'dash', 'walk', 'sleep'],
    correctAnswer: 'dash',
    difficulty: 'medium'
  },
  {
    id: '6',
    type: 'fillBlank',
    question: "The rabbit can ________ very fast.",
    word: 'dash',
    definition: 'To run or move very quickly',
    correctAnswer: 'dash',
    difficulty: 'hard'
  }
];