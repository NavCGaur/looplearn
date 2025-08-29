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
} from "../../state/api/mathApi";

const CLASS_OPTIONS = [
  'class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'
];

const SUBJECT_OPTIONS = [
  'mathematics', 'physics', 'chemistry', 'biology', 'science', 'social-science'
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
  [key: string]: any; // allow dynamic assignment from UI
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
      const newFilters = { ...prev, page: 1 };
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
              to="/admin/dashboard/math-question-manager" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Question Manager
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Plus className="mr-3 h-8 w-8 text-green-600" />
            Math Question Assigner
          </h1>
          <p className="text-gray-600 mt-2">Select and assign math questions from the database to classes</p>
        </div>
      </div>

      {/* The rest of the UI mirrors the science assigner but uses mathApi */}
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

            {/* Rest of filters and results omitted for brevity - identical to science assigner layout */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
