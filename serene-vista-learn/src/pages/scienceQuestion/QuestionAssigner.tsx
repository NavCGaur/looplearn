import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, BookOpen, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  useGetAvailableQuestionsForAssignmentQuery,
  useAssignNewQuestionsMutation
} from "../../state/api/scienceApi";

const CLASS_OPTIONS = [
  'class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'
];

const SUBJECT_OPTIONS = [
  'mathematics', 'physics', 'chemistry', 'biology', 'science'
];

const QUESTION_TYPE_OPTIONS = [
  'fill-in-blank', 'multiple-choice', 'true-false', 'short-answer'
];

const DIFFICULTY_OPTIONS = [
  'easy', 'medium', 'hard'
];

interface Question {
  _id: string;
  questionText: string;
  answer: string;
  classStandard: string;
  subject: string;
  chapter: string;
  topic: string;
  questionType: string;
  difficulty: string;
  createdAt: string;
}

interface FilterParams {
  classStandard: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  questionType?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export default function QuestionAssigner() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterParams>({
    classStandard: '',
    page: 1,
    limit: 20
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // RTK Query hooks
  const { data: questionsData, isLoading: isLoadingQuestions, error: questionsError } = useGetAvailableQuestionsForAssignmentQuery(
    filters,
    { skip: !hasAppliedFilters || !filters.classStandard }
  );

  const [assignNewQuestions, { isLoading: isAssigning }] = useAssignNewQuestionsMutation();

  const handleFilterChange = (field: keyof FilterParams, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 1 }; // Reset to first page when filters change
      
      // Convert "__all__" to undefined for API calls
      if (value === "" || value === "__all__") {
        delete newFilters[field];
      } else {
        newFilters[field] = value;
      }
      
      return newFilters;
    });
    setHasAppliedFilters(false);
    setSelectedQuestions([]);
  };

  const applyFilters = () => {
    if (!filters.classStandard) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive",
      });
      return;
    }
    setHasAppliedFilters(true);
    setSelectedQuestions([]);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (!questions.length) return;
    
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((q: Question) => q._id));
    }
  };

  const handleAssignSelected = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select questions to assign",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to assign ${selectedQuestions.length} selected question(s) to ${filters.classStandard}?`)) {
      try {
        const response = await assignNewQuestions({ 
          classStandard: filters.classStandard, 
          questionIds: selectedQuestions 
        }).unwrap();
        
        toast({
          title: "Success",
          description: response.message || "Questions assigned successfully",
        });
        setSelectedQuestions([]);
        
        // Refresh the data
        setHasAppliedFilters(false);
        setTimeout(() => setHasAppliedFilters(true), 100);
        
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to assign questions",
          variant: "destructive",
        });
      }
    }
  };

  const questions = questionsData?.data?.questions || [];
  const totalQuestions = questionsData?.data?.totalQuestions || 0;
  const totalPages = questionsData?.data?.totalPages || 0;
  const currentPage = filters.page || 1;
  const assignmentInfo = questionsData?.data?.assignmentInfo;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              to="/admin/dashboard/question-manager" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Question Manager
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Plus className="mr-3 h-8 w-8 text-green-600" />
            Question Assigner
          </h1>
          <p className="text-gray-600 mt-2">Select and assign questions from the database to classes</p>
        </div>
      </div>

      {/* Assignment Info */}
      {assignmentInfo && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    {assignmentInfo.classStandard.replace('-', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-green-600">
                    Currently Assigned: {assignmentInfo.totalAssigned} questions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">
                  Available for Assignment: {assignmentInfo.availableForAssignment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Available Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select 
                value={filters.classStandard} 
                onValueChange={(value) => handleFilterChange('classStandard', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls.replace('-', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={filters.subject || '__all__'} 
                onValueChange={(value) => handleFilterChange('subject', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Subjects</SelectItem>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type</Label>
              <Select 
                value={filters.questionType || '__all__'} 
                onValueChange={(value) => handleFilterChange('questionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {QUESTION_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={filters.difficulty || '__all__'} 
                onValueChange={(value) => handleFilterChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Difficulties</SelectItem>
                  {DIFFICULTY_OPTIONS.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Filter */}
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Input
                placeholder="Filter by chapter..."
                value={filters.chapter || ''}
                onChange={(e) => handleFilterChange('chapter', e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                placeholder="Search questions, answers..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button 
              onClick={applyFilters} 
              disabled={!filters.classStandard}
              className="flex items-center"
            >
              <Search className="mr-2 h-4 w-4" />
              Find Available Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Results */}
      {hasAppliedFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Available Questions ({totalQuestions} total)
              </CardTitle>
              {questions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedQuestions.length === questions.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAssignSelected}
                    disabled={selectedQuestions.length === 0 || isAssigning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isAssigning ? 'Assigning...' : `Assign Selected (${selectedQuestions.length})`}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {questionsError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  Error loading questions: {(questionsError as any)?.data?.message || 'Failed to load questions'}
                </p>
              </div>
            )}
            
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3">Loading available questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No available questions found for assignment.</p>
                {filters.classStandard && (
                  <p className="text-sm mt-2">
                    All questions for {filters.classStandard} may already be assigned, or no questions exist with the current filters.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((question: Question) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedQuestions.includes(question._id)}
                          onCheckedChange={() => toggleQuestionSelection(question._id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {question.questionText}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Answer:</strong> {question.answer}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{question.classStandard}</Badge>
                            <Badge variant="outline">{question.subject}</Badge>
                            <Badge variant="outline">{question.chapter}</Badge>
                            <Badge variant="outline">{question.topic}</Badge>
                            <Badge variant="outline">{question.questionType}</Badge>
                            <Badge 
                              variant="outline"
                              className={
                                question.difficulty === 'easy' ? 'text-green-600 border-green-600' :
                                question.difficulty === 'medium' ? 'text-yellow-600 border-yellow-600' :
                                'text-red-600 border-red-600'
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(question.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages} ({totalQuestions} available questions)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
