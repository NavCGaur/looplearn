import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Trophy, 
  Book, 
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface Student {
  id: string;
  name: string;
  wordsLearned: number;
  quizzesTaken: number;
  points: number;
  rank?: number;
  avatar?: string;
}

const dummyData: Student[] = [
  { id: "1", name: "Emma Johnson", wordsLearned: 245, quizzesTaken: 32, points: 520 },
  { id: "2", name: "Liam Smith", wordsLearned: 190, quizzesTaken: 28, points: 430 },
  { id: "3", name: "Olivia Davis", wordsLearned: 310, quizzesTaken: 45, points: 650 },
  { id: "4", name: "Noah Wilson", wordsLearned: 175, quizzesTaken: 22, points: 375 },
  { id: "5", name: "Sophia Martinez", wordsLearned: 280, quizzesTaken: 38, points: 590 },
  { id: "6", name: "Jackson Brown", wordsLearned: 220, quizzesTaken: 30, points: 470 },
  { id: "7", name: "Ava Garcia", wordsLearned: 260, quizzesTaken: 35, points: 540 },
  { id: "8", name: "Lucas Anderson", wordsLearned: 165, quizzesTaken: 20, points: 345 },
  { id: "9", name: "Mia Thomas", wordsLearned: 290, quizzesTaken: 40, points: 610 },
  { id: "10", name: "Ethan Rodriguez", wordsLearned: 210, quizzesTaken: 26, points: 450 },
];

// Define the colors for top ranks
const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-200 border-yellow-400 text-yellow-800"; // Gold
    case 2:
      return "bg-gray-200 border-gray-400 text-gray-800"; // Silver
    case 3:
      return "bg-amber-100 border-amber-400 text-amber-800"; // Bronze
    default:
      return "bg-blue-100 border-blue-300 text-blue-800"; // Blue for everyone else
  }
};

const LeaderBoard: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Student>("points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = 5;

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    // First add ranks based on points
    const rankedData = [...dummyData].sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    // Then filter by search
    const filtered = rankedData.filter(student => 
      student.name.toLowerCase().includes(search.toLowerCase())
    );

    // Then sort by the selected field and direction
    return filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [dummyData, search, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredData, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortableHeader: React.FC<{
    field: keyof Student;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const renderMobileView = () => (
    <div className="space-y-4">
      {paginatedData.map(student => (
        <Card key={student.id} className={`border-2 ${getRankColor(student.rank || 0)} animate-fade-in`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold ${student.rank && student.rank <= 3 ? "bg-langlearn-orange" : ""}`}>
                  {student.rank}
                </div>
                <CardTitle className="text-lg">{student.name}</CardTitle>
              </div>
              <Badge className="bg-langlearn-blue">
                {student.points} pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Book className="h-4 w-4 text-langlearn-blue" />
                <span className="text-sm">{student.wordsLearned} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-langlearn-orange" />
                <span className="text-sm">{student.quizzesTaken} quizzes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <Table className="border-2 rounded-lg overflow-hidden">
      <TableHeader>
        <TableRow className="bg-blue-50">
          <TableHead>Rank</TableHead>
          <TableHead>Student</TableHead>
          <SortableHeader field="wordsLearned">Words Learned</SortableHeader>
          <SortableHeader field="quizzesTaken">Quizzes Taken</SortableHeader>
          <SortableHeader field="points">Points</SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedData.map(student => (
          <TableRow key={student.id} className={`animate-fade-in hover:bg-blue-50 transition-colors ${student.rank === 1 ? "bg-yellow-50" : ""}`}>
            <TableCell>
              <div className="flex items-center justify-center">
                {student.rank === 1 ? (
                  <Trophy className="h-6 w-6 text-yellow-500" />
                ) : student.rank === 2 ? (
                  <Award className="h-6 w-6 text-gray-500" />
                ) : student.rank === 3 ? (
                  <Award className="h-6 w-6 text-amber-700" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                    {student.rank}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-langlearn-blue" />
                {student.wordsLearned}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-langlearn-orange" />
                {student.quizzesTaken}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${student.rank && student.rank <= 3 ? "bg-langlearn-orange" : "bg-langlearn-blue"}`}>
                {student.points} pts
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <Trophy className="h-6 w-6 text-langlearn-orange" /> 
          <h2 className="text-2xl font-bold">Language Champions</h2>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Find a student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default LeaderBoard;
