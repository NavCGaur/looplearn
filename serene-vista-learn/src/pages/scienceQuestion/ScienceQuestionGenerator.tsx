// Updated QuestionGenerator Component
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Brain, Plus, ListChecks, Save, CheckCircle, Loader2, Info, AlertCircle } from "lucide-react";
import { useGenerateQuestionsMutation, useSaveSelectedQuestionsMutation } from "../../state/api/scienceApi.ts";
import { questionGenerationRequestSchema, type QuestionGenerationRequest, type InsertScienceQuestion } from "../../shared/schema.ts";
import { TextWithMath } from "@/components/ui/TextWithMath";
import { useMathRenderer } from "@/hooks/useMathRenderer.ts";

// QuestionDisplay Component
interface QuestionDisplayProps {
  question: InsertScienceQuestion;
  index: number;
  isSelected: boolean;
  onSelectionChange: (index: number, checked: boolean) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  index, 
  isSelected, 
  onSelectionChange 
}) => {
  const { isKatexReady, katexError } = useMathRenderer();
  
  const handleMathError = (error: Error, expression: string) => {
    console.error(`Math rendering error in question ${index + 1}:`, error);
    // You could show a toast notification here if needed
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <Checkbox
          id={`question-${index}`}
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(index, checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
              Q{index + 1}
            </span>
            <span className="text-xs text-gray-500">Fill in the Blank</span>
            {!isKatexReady && !katexError && (
              <span className="text-xs text-amber-500 flex items-center space-x-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading math renderer...</span>
              </span>
            )}
            {katexError && (
              <span className="text-xs text-red-500 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Math rendering unavailable</span>
              </span>
            )}
          </div>
          
          {/* Enhanced Question Text with Math */}
          <div className="mb-3">
            <p className="text-gray-800 leading-relaxed">
              <TextWithMath onMathError={handleMathError}>
                {question.questionText.replace('_____', '____')}
              </TextWithMath>
            </p>
          </div>
          
          {/* Enhanced Answer Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Answer:</span>
            </div>
            <p className="text-green-800 font-mono">
              <TextWithMath onMathError={handleMathError}>
                {question.answer}
              </TextWithMath>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main QuestionGenerator Component
export default function QuestionGenerator() {
  const [generatedQuestions, setGeneratedQuestions] = useState<InsertScienceQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { isKatexReady, katexError } = useMathRenderer();
  const [standard, setStandard] = useState("");

  const form = useForm<QuestionGenerationRequest>({
    resolver: zodResolver(questionGenerationRequestSchema),
    defaultValues: {
      classStandard: "",
      subject: "",
      chapter: "",
      topic: "All",
      questionType: "fill-in-blank",
      numberOfQuestions: 5,
    },
  });

  const [generateQuestions] = useGenerateQuestionsMutation();
  const [saveSelectedQuestions] = useSaveSelectedQuestionsMutation();

  const handleGenerateQuestions = async (data: QuestionGenerationRequest) => {
    setIsGenerating(true);
    try {

      console.log("Generating questions with data:", data);
      setStandard(data.classStandard);
      console.log("Selected standard:", standard);
      

      const response = await generateQuestions(data).unwrap();
      setGeneratedQuestions(response.questions);
      console.log("Generated questions:", response);
      setSelectedQuestions(new Set());
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionSelection = (index: number, checked: boolean) => {
    const newSelection = new Set(selectedQuestions);
    if (checked) {
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    setSelectedQuestions(newSelection);
    console.log("Updated selected questions:", Array.from(newSelection));
  };

  const handleSaveSelectedQuestions = async () => {
  const questionsToSave = generatedQuestions.filter((_, index) =>
    selectedQuestions.has(index)
  );

  if (questionsToSave.length === 0) {
    toast({
      title: "No Selection",
      description: "Please select at least one question to save.",
      variant: "destructive",
    });
    return;
  }

  console.log("Saving selected questions :", questionsToSave);

  //@ts-ignore
  const questionIds = questionsToSave.map((q) => q._id); // using id from backend

  console.log("Selected question IDs:", questionIds);

  setIsSaving(true);
  try {
    const response = await saveSelectedQuestions({
      classStandard: standard, // already set from handleGenerateQuestions
      questionIds,
    }).unwrap();

    toast({
      title: "Success",
      description: response.message,
    });
    setSelectedQuestions(new Set());
  } catch (error) {
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to assign questions. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Inline CSS for Math Rendering */}
      <style>
        {`
        .math-renderer {
          display: inline-block;
          vertical-align: baseline;
        }

        .math-renderer.loading {
          opacity: 0.7;
        }

        .math-error {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }

        .katex-display {
          margin: 0.5em 0;
        }

        .katex {
          font-size: 1em;
        }

        .katex .base {
          display: inline-block;
        }
        `}
      </style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Question Generator</h1>
                {katexError && (
                  <p className="text-xs text-amber-600">Math rendering limited - some formulas may not display correctly</p>
                )}
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, <span className="font-medium">Ms. Anderson</span></span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Question Generation Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>Generate Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleGenerateQuestions)} className="space-y-4">
                    
                    {/* Class/Standard Dropdown */}
                    <FormField
                      control={form.control}
                      name="classStandard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Class/Standard <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="class-6">Class 6</SelectItem>
                              <SelectItem value="class-7">Class 7</SelectItem>
                              <SelectItem value="class-8">Class 8</SelectItem>
                              <SelectItem value="class-9">Class 9</SelectItem>
                              <SelectItem value="class-10">Class 10</SelectItem>
                              <SelectItem value="class-11">Class 11</SelectItem>
                              <SelectItem value="class-12">Class 12</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject Dropdown */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Subject <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="chemistry">Chemistry</SelectItem>
                              <SelectItem value="biology">Biology</SelectItem>
                              <SelectItem value="science">General Science</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Chapter Input */}
                    <FormField
                      control={form.control}
                      name="chapter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chapter <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Atoms and Molecules" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Topic Input */}
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Topic
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Dalton's Atomic Theory" defaultValue="All"  {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Question Type Dropdown */}
                    <FormField
                      control={form.control}
                      name="questionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">More question types coming soon</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Number of Questions */}
                    <FormField
                      control={form.control}
                      name="numberOfQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={100} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Maximum 100 questions per generation</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Generate Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                {/* API Cost Information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-blue-700">
                      Generation uses AI processing. Estimated cost: ~$0.02 per request.
                    </p>
                  </div>
                </div>

                {/* Math Renderer Status */}
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    {isKatexReady ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-700">Math renderer ready</span>
                      </>
                    ) : katexError ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        {console.log('Math renderer error:', katexError)}
                        <span className="text-xs text-red-700">Math renderer error</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                        <span className="text-xs text-blue-700">Loading math renderer...</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Generated Questions Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-secondary" />
                    <span>Generated Questions</span>
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {selectedQuestions.size} of {generatedQuestions.length} selected
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {generatedQuestions.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {generatedQuestions.map((question, index) => (
                        <QuestionDisplay
                          key={index}
                          question={question}
                          index={index}
                          isSelected={selectedQuestions.has(index)}
                          onSelectionChange={handleQuestionSelection}
                        />
                      ))}
                    </div>

                    {/* Save Selected Questions Button */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {selectedQuestions.size} questions selected for saving
                      </div>
                      <Button 
                        onClick={handleSaveSelectedQuestions}
                        disabled={selectedQuestions.size === 0 || isSaving}
                        className="bg-gray-500 hover:bg-gray-800"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Selected Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ListChecks className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Generated Yet</h3>
                    <p className="text-gray-600 mb-4">Fill out the form on the left and click "Generate Questions" to get started.</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Brain className="h-4 w-4 text-yellow-500" />
                        <span>AI-Powered</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ListChecks className="h-4 w-4 text-blue-500" />
                        <span>Subject-Specific</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Ready to Use</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}