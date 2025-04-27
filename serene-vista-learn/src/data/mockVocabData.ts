export interface VocabWord {
    id: string;
    word: string;
    definition: string;
    examples: string[];
    dateAdded: string;
    mastered: boolean;
    timesReviewed: number;
    lastReviewDate: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }
  
  export const mockVocabWords: VocabWord[] = [
    {
      id: '1',
      word: 'Ubiquitous',
      definition: 'Present, appearing, or found everywhere',
      examples: [
        'Mobile phones have become ubiquitous in modern society',
        'The ubiquitous smell of coffee in the morning'
      ],
      dateAdded: '2024-03-15',
      mastered: true,
      timesReviewed: 8,
      lastReviewDate: '2024-04-20',
      difficulty: 'Medium'
    },
    {
      id: '2',
      word: 'Ephemeral',
      definition: 'Lasting for a very short time',
      examples: [
        'The ephemeral nature of fashion trends',
        'Social media posts are often ephemeral'
      ],
      dateAdded: '2024-03-20',
      mastered: false,
      timesReviewed: 3,
      lastReviewDate: '2024-04-22',
      difficulty: 'Hard'
    },
    {
      id: '3',
      word: 'Pragmatic',
      definition: 'Dealing with things sensibly and realistically',
      examples: [
        'We need a pragmatic approach to solving this problem',
        "She's known for her pragmatic leadership style"
      ],
      dateAdded: '2024-04-01',
      mastered: true,
      timesReviewed: 5,
      lastReviewDate: '2024-04-23',
      difficulty: 'Easy'
    }
  ];
  