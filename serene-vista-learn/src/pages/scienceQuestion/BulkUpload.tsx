import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react";
import { useBulkUploadScienceQuestionsMutation } from "@/state/api/scienceApi";

interface BulkQuestion {
  questionText: string;
  answer: string;
  classStandard: string;
  subject: string;
  chapter: string;
  topic: string;
  questionType?: string;
  difficulty?: string;
}

interface UploadResponse {
  success: boolean;
  questions?: any[];
  count?: number;
  message: string;
  errors?: any[];
}

export default function BulkUpload() {
  const [jsonInput, setJsonInput] = useState("");
  const [lastUploadResult, setLastUploadResult] = useState<UploadResponse | null>(null);
  const { toast } = useToast();
  
  const [bulkUploadQuestions, { isLoading: isUploading }] = useBulkUploadScienceQuestionsMutation();

  const validateQuestionFormat = (questions: any[]): boolean => {
    const requiredFields = ['questionText', 'answer', 'classStandard', 'subject', 'chapter', 'topic'];
    const validClassStandards = ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'];
    const validSubjects = ['mathematics', 'physics', 'chemistry', 'biology', 'science', 'social-science'];
    
    return questions.every(q => {
      // Check required fields
      const hasRequiredFields = requiredFields.every(field => 
        q.hasOwnProperty(field) && typeof q[field] === 'string' && q[field].trim().length > 0
      );
      
      // Check valid enum values
      const hasValidClassStandard = validClassStandards.includes(q.classStandard);
      const hasValidSubject = validSubjects.includes(q.subject);
      
      return hasRequiredFields && hasValidClassStandard && hasValidSubject;
    });
  };

  const handleUploadQuestions = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste your JSON questions data.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse JSON
      const questions: BulkQuestion[] = JSON.parse(jsonInput);
      
      if (!Array.isArray(questions)) {
        throw new Error("Input must be an array of questions");
      }

      if (questions.length === 0) {
        throw new Error("Questions array cannot be empty");
      }

      // Validate question format
      if (!validateQuestionFormat(questions)) {
        throw new Error("Some questions have invalid format. Please check required fields and enum values.");
      }

      const result = await bulkUploadQuestions({ questions }).unwrap();
      
      setLastUploadResult({
        success: true,
        questions: result.questions,
        count: result.count,
        message: result.message,
      });

      toast({
        title: "Success",
        description: `${result.count} questions uploaded and assigned successfully!`,
      });

      // Clear the input
      setJsonInput("");

    } catch (error: any) {
      console.error("Upload failed:", error);
      let errorMessage = error?.data?.message || error?.message || 'Unknown error occurred';
      
      setLastUploadResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const sampleJson = `[
  {
    "questionText": "Water freezes at __ degrees Celsius.",
    "answer": "0",
    "classStandard": "class-7",
    "subject": "science",
    "chapter": "Matter",
    "topic": "States of Matter",
    "questionType": "fill-in-blank",
    "difficulty": "easy"
  },
  {
    "questionText": "The chemical formula for water is ____.",
    "answer": "H2O",
    "classStandard": "class-8",
    "subject": "chemistry",
    "chapter": "Chemical Formulas",
    "topic": "Basic Compounds",
    "questionType": "fill-in-blank",
    "difficulty": "medium"
  }
]`;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="mr-3 h-8 w-8 text-blue-600" />
          Bulk Question Upload
        </h1>
        <p className="text-gray-600">
          Upload multiple science questions in JSON format to MongoDB and automatically assign them to class standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              JSON Questions Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">Paste JSON Questions Array</Label>
              <Textarea
                id="json-input"
                placeholder="Paste your JSON array of questions here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            <Button 
              onClick={handleUploadQuestions}
              disabled={isUploading || !jsonInput.trim()}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Questions
                </>
              )}
            </Button>

            {/* Result Display */}
            {lastUploadResult && (
              <div className={`p-4 rounded-lg border ${
                lastUploadResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  {lastUploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      lastUploadResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {lastUploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                    </p>
                    <p className={`text-sm ${
                      lastUploadResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lastUploadResult.message}
                    </p>
                    {lastUploadResult.success && lastUploadResult.count && (
                      <p className="text-sm text-green-600 mt-1">
                        Questions saved with unique IDs and assigned to appropriate classes.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Format */}
        <Card>
          <CardHeader>
            <CardTitle>Sample JSON Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use this format for your questions. Each question will be automatically assigned to its specified class standard.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
                  <code>{sampleJson}</code>
                </pre>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Required Fields:</h4>
                <ul className="text-gray-600 space-y-1 text-xs">
                  <li>• <strong>questionText</strong>: The question with blanks (____)</li>
                  <li>• <strong>answer</strong>: The correct answer</li>
                  <li>• <strong>classStandard</strong>: class-6 to class-12</li>
                  <li>• <strong>subject</strong>: mathematics, physics, chemistry, biology, science</li>
                  <li>• <strong>chapter</strong>: Chapter name</li>
                  <li>• <strong>topic</strong>: Specific topic</li>
                </ul>
                
                <h4 className="font-medium mt-3">Optional Fields:</h4>
                <ul className="text-gray-600 space-y-1 text-xs">
                  <li>• <strong>questionType</strong>: fill-in-blank (default), multiple-choice, true-false, short-answer</li>
                  <li>• <strong>difficulty</strong>: easy, medium (default), hard</li>
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setJsonInput(sampleJson)}
                className="w-full"
              >
                Use Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}