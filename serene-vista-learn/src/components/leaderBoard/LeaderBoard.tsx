import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react"; 
// Table components (assuming they're available in your project)
const Table = ({ className = "", children, ...props }) => (
  <table className={`w-full ${className}`} {...props}>
    {children}
  </table>
);

const TableHeader = ({ children }) => <thead>{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableHead = ({ className = "", children, ...props }) => (
  <th className={`px-4 py-2 text-left font-medium ${className}`} {...props}>
    {children}
  </th>
);
const TableRow = ({ className = "", children, ...props }) => (
  <tr className={`border-b ${className}`} {...props}>
    {children}
  </tr>
);
const TableCell = ({ className = "", children, ...props }) => (
  <td className={`px-4 py-2 ${className}`} {...props}>
    {children}
  </td>
);
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Trophy, 
  Book, 
  Star,
  User,
  Target,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

import {
       useGetUsersPointsQuery,
} from "../../state/api/userApi";

interface Student {
  id: string;
  userId: string;
  name: string;
  wordsLearned: number;
  quizzesTaken: number;
  points: number;
  rank?: number;
  avatar?: string;
}

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

const LeaderBoard = () => {

   const dispatch = useDispatch();
  
    // @ts-ignore
  const userId = useSelector((state) => state.auth?.user?.uid);
  //@ts-ignore
  const { data: usersData = [], isLoading, isError, error } = useGetUsersPointsQuery(userId);

  console.log("Users Data:", usersData);
 

  


 
  const students = useMemo(() => {
    if (isLoading || isError || !usersData?.users) return [];

    return usersData.users.map((user, index) => ({
      id: String(index + 1),
      userId: user.userId || user.uid || "", // Handle different possible field names
      name: user.name || "Unnamed",
      wordsLearned: user.wordsLearned ?? 0,
      quizzesTaken: user.quizzesTaken ?? 0,
      points: user.points ?? 0,
    }));
  }, [usersData, isLoading, isError]);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Student>("points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserContext, setShowUserContext] = useState(false);
  const isMobile = useIsMobile();
  const itemsPerPage = 5;

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    // First add ranks based on points
    const rankedData = [...students].sort((a, b) => b.points - a.points)
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
  }, [students, search, sortField, sortDirection]);

  // Find current user data
  const currentUser = useMemo(() => {
    if (!userId) return null;
    const rankedData = [...students].sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));
    return rankedData.find(student => student.userId === userId);
  }, [students, userId]);

  // Calculate next rank info
  const nextRankInfo = useMemo(() => {
    if (!currentUser) return null;
    
    const rankedData = [...students].sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));
    
    const nextRankUser = rankedData.find(student => student.rank === (currentUser.rank! - 1));
    
    if (!nextRankUser) {
      return { isTop: true, pointsNeeded: 0, nextRank: 0 };
    }
    
    const pointsNeeded = nextRankUser.points - currentUser.points + 1;
    const progressPercentage = Math.min(100, (currentUser.points / nextRankUser.points) * 100);
    
    return {
      isTop: false,
      pointsNeeded,
      nextRank: nextRankUser.rank,
      progressPercentage
    };
  }, [currentUser, students]);

  // Get user context data (±2 users around current user)
  const userContextData = useMemo(() => {
    if (!currentUser) return [];
    
    const rankedData = [...students].sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));
    
    const userIndex = rankedData.findIndex(student => student.userId === userId);
    if (userIndex === -1) return [];
    
    // Handle edge cases
    let startIndex: number;
    let endIndex: number;
    
    if (userIndex <= 2) {
      // Top users: show current user + 4 users below
      startIndex = 0;
      endIndex = Math.min(4, rankedData.length - 1);
    } else if (userIndex >= rankedData.length - 3) {
      // Bottom users: show 4 users above + current user
      startIndex = Math.max(0, rankedData.length - 5);
      endIndex = rankedData.length - 1;
    } else {
      // Middle users: show 2 above + current user + 2 below
      startIndex = userIndex - 2;
      endIndex = userIndex + 2;
    }
    
    return rankedData.slice(startIndex, endIndex + 1);
  }, [currentUser, students, userId]);

  // Pagination
  const displayData = showUserContext ? userContextData : sortedAndFilteredData;
  const paginatedData = useMemo(() => {
    if (showUserContext) return displayData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayData.slice(startIndex, startIndex + itemsPerPage);
  }, [displayData, currentPage, showUserContext]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleFindMe = () => {
    if (!currentUser) return;
    setShowUserContext(true);
    setSearch(""); // Clear search when showing user context
  };

  const handleBackToFullLeaderboard = () => {
    setShowUserContext(false);
  };

  const SortableHeader = ({ field, children }) => (
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

  // User Stats Panel Component
// User Stats Panel Component - now collapsible
const UserStatsPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log("Current User:", currentUser);
  if (!currentUser) return null;

  return (
    <Card className="border-2 mb-3 ">
      <CardHeader 
        className="pb-3 pt-3 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-blue-600 text-xl">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Your Current Performance
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">#{currentUser.rank}</div>
              <div className="text-sm text-gray-600">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{currentUser.points}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{currentUser.wordsLearned}</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{currentUser.quizzesTaken}</div>
              <div className="text-sm text-gray-600">Quizzes</div>
            </div>
          </div>
          
          {/* Next Rank Progress */}
          <div className="space-y-2">
            {nextRankInfo?.isTop ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">You're at the top! 🎉</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Next rank: {nextRankInfo?.pointsNeeded} points away</span>
                  </div>
                </div>
                <Progress value={nextRankInfo?.progressPercentage || 0} className="h-2" />
              </>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFindMe}
              disabled={showUserContext}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Target className="h-4 w-4 mr-1" />
              Find Me in List
            </Button>
            {showUserContext && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToFullLeaderboard}
                className="border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Full List
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

  const renderMobileView = () => (
    <div className="space-y-4">
      {paginatedData.map(student => (
        <Card 
          key={student.id} 
          className={`border-2 ${getRankColor(student.rank || 0)} ${
            student.userId === userId ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold ${student.rank && student.rank <= 3 ? "bg-orange-500" : ""}`}>
                  {student.rank}
                </div>
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  {student.userId === userId && (
                    <Badge variant="outline" className="text-xs mt-1">You</Badge>
                  )}
                </div>
              </div>
              <Badge className="bg-blue-500 text-white">
                {student.points} pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Book className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{student.wordsLearned} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-orange-600" />
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
          <TableRow 
            key={student.id} 
            className={`animate-fade-in hover:bg-blue-50 transition-colors ${
              student.rank === 1 ? "bg-yellow-50" : ""
            } ${
              student.userId === userId ? "bg-blue-100 border-l-4 border-blue-500" : ""
            }`}
          >
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
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {student.name}
                {student.userId === userId && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-blue-600" />
                {student.wordsLearned}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-600" />
                {student.quizzesTaken}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${student.rank && student.rank <= 3 ? "bg-orange-500" : "bg-blue-500"} text-white`}>
                {student.points} pts
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Loading leaderboard...</div>;
  }

  if (isError) {
    return <div className="text-center py-10 text-red-500">Failed to load leaderboard.</div>;
  }

  return (
    <div className="space-y-6 w-full">
     

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <Trophy className="h-6 w-6 text-orange-600" /> 
          <h2 className="text-2xl font-bold">
            {showUserContext ? "Your Position" : "Language Champions"}
          </h2>
        </div>
        
        {!showUserContext && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Find a student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </div>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {totalPages > 1 && !showUserContext && (
        <Pagination>
          <PaginationContent>
            <PaginationItem className="cursor-pointer">
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
              <PaginationItem key={page} className="cursor-pointer">
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem className="cursor-pointer">
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

       {/* User Stats Panel */}
      <UserStatsPanel />
    </div>
  );
};

export default LeaderBoard;