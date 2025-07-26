import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { Search, SortAsc, SortDesc, ListOrdered, Filter } from 'lucide-react';

interface WordDetails {
  _id: string;
  word: string;
  definition: string;
  // Add other word properties as needed
}

interface VocabularyItem {
  _id: string;
  wordId: WordDetails;
  rating: number;
  lastReviewed: string;
  nextReviewDate: string;
  addedAt: string;
  // Add other vocabulary-specific properties as needed
}

interface MyWordListProps {
  userId?: string;
}

const MyWordList = ({ userId }: MyWordListProps) => {
  const isMobile = useIsMobile();
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'word' | 'dateAdded'>('word');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'mastered' | 'learning'>('all');

  // Get words from Redux store
  // @ts-ignore
  const vocabularyItems = useSelector((state) => state.auth?.user?.vocabulary || []) as VocabularyItem[];



  // Determine mastery based on rating (assuming rating 5 is mastered)
  const isMastered = (rating: number) => rating >= 5;

  // Filter and sort words
  const processedWords = React.useMemo(() => {
    // First apply search filter
    let filteredWords = vocabularyItems.filter(item => 
      item.wordId.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.wordId.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply mastery filter
    if (filterBy === 'mastered') {
      filteredWords = filteredWords.filter(item => isMastered(item.rating));
    } else if (filterBy === 'learning') {
      filteredWords = filteredWords.filter(item => !isMastered(item.rating));
    }
    
    // Then sort
    return [...filteredWords].sort((a, b) => {
      if (sortBy === 'word') {
        const comparison = a.wordId.word.localeCompare(b.wordId.word);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const dateA = new Date(a.addedAt).getTime();
        const dateB = new Date(b.addedAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [vocabularyItems, searchTerm, sortBy, sortOrder, filterBy]);

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
        <CardTitle className="text-center text-2xl font-bold">My Words</CardTitle>
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
                {processedWords.map((item, index) => (
                  <div 
                    key={item._id}
                    className="p-4 rounded-md border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedWord(
                      // @ts-ignore
                      item.wordId)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-medium">{item.wordId.word}</h3>
                      </div>
                      <Badge variant={isMastered(item.rating) ? "default" : "secondary"}>
                        {isMastered(item.rating) ? "Mastered" : "Learning"}
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
                    <TableHead>Rating</TableHead>
                    <TableHead>Last Reviewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedWords.map((item, index) => (
                    <TableRow 
                      key={item._id} 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedWord(
                        // @ts-ignore
                        item.wordId)}
                    >
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.wordId.word}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2">
                        {item.wordId.definition}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isMastered(item.rating) ? "default" : "secondary"} 
                              className={isMastered(item.rating) ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                          {isMastered(item.rating) ? "Mastered" : "Learning"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`w-3 h-3 rounded-full ${i < item.rating ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.lastReviewed ? new Date(item.lastReviewed).toLocaleDateString() : 'Not reviewed'}
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