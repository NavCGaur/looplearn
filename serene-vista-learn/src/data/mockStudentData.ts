export interface Student {
    id: string;
    name: string;
    email: string;
    assignedWords: string[]; // Array of word IDs
  }
  
  export const mockStudents: Student[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      assignedWords: ['1', '2']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      assignedWords: ['2', '3']
    },
    {
      id: '3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      assignedWords: ['1']
    }
  ];
  