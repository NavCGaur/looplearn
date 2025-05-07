import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import VocabDetailModal from "./VocabDetailModal.jsx";
import { VocabWord, mockVocabWords } from '@/data/mockVocabData';
import { Search, SortAsc, SortDesc, ListOrdered, Filter } from 'lucide-react';

interface MyWordListProps {
  userId?: string; // Optional user ID if we want to filter by specific user
}

const MyWordList = ({ userId }: MyWordListProps) => {
  const isMobile = useIsMobile();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'word' | 'dateAdded'>('word');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'mastered' | 'learning'>('all');

  // Initialize with mock data
  useEffect(() => {
    // In a real app, this would be an API call filtered by userId if provided
    setWords(mockVocabWords);
  }, [userId]);

  // Filter and sort words
  const processedWords = React.useMemo(() => {
    // First apply search filter
    let filteredWords = words.filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply mastery filter
    if (filterBy === 'mastered') {
      filteredWords = filteredWords.filter(word => word.mastered);
    } else if (filterBy === 'learning') {
      filteredWords = filteredWords.filter(word => !word.mastered);
    }
    
    // Then sort
    return [...filteredWords].sort((a, b) => {
      if (sortBy === 'word') {
        const comparison = a.word.localeCompare(b.word);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const dateA = new Date(a.dateAdded).getTime();
        const dateB = new Date(b.dateAdded).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [words, searchTerm, sortBy, sortOrder, filterBy]);

  const handleSort = (field: 'word' | 'dateAdded') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <Card className="m-6 overflow-hidden shadow-lg bg-card border border-slate-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardTitle className="text-center text-2xl font-bold">My Vocabulary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium">Filter by Status</h4>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={filterBy === 'all' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setFilterBy('all')}
                      className="justify-start"
                    >
                      All Words
                    </Button>
                    <Button 
                      variant={filterBy === 'mastered' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setFilterBy('mastered')}
                      className="justify-start"
                    >
                      Mastered
                    </Button>
                    <Button 
                      variant={filterBy === 'learning' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setFilterBy('learning')}
                      className="justify-start"
                    >
                      Still Learning
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('word')}
              className="gap-2"
            >
              <ListOrdered className="h-4 w-4" />
              Word
              {sortBy === 'word' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('dateAdded')}
              className="gap-2"
            >
              <ListOrdered className="h-4 w-4" />
              Date
              {sortBy === 'dateAdded' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {processedWords.length === 0 ? (
          <div className="text-center p-10">
            <p className="text-gray-500">No vocabulary words found. Add some words to get started!</p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="space-y-2">
                {processedWords.map((word, index) => (
                  <div 
                    key={word.id}
                    className="p-4 rounded-md border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedWord(word)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-medium">{word.word}</h3>
                      </div>
                      <Badge variant={word.mastered ? "default" : "secondary"}>
                        {word.mastered ? "Mastered" : "Learning"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>Word</TableHead>
                    <TableHead className="w-1/3">Definition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedWords.map((word, index) => (
                    <TableRow 
                      key={word.id} 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedWord(word)}
                    >
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2">
                        {word.definition}
                      </TableCell>
                      <TableCell>
                        <Badge variant={word.mastered ? "default" : "secondary"} className={word.mastered ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                          {word.mastered ? "Mastered" : "Learning"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        <VocabDetailModal 
          word={selectedWord}
          open={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      </CardContent>
    </Card>
  );
};

export default MyWordList;