import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react";
import { useBulkUploadMathQuestionsMutation } from "@/state/api/mathApi";

export default function MathBulkUpload() {
  const [jsonInput, setJsonInput] = useState("");
  const [lastUploadResult, setLastUploadResult] = useState(null as any);
  const { toast } = useToast();
  const [bulkUploadQuestions, { isLoading: isUploading }] = useBulkUploadMathQuestionsMutation();

  const validateQuestionFormat = (questions: any[]): boolean => {
    const requiredFields = ['questionText', 'classStandard', 'subject', 'chapter', 'topic', 'options', 'correctOptionIndex'];
    const validClassStandards = ['class-6','class-7','class-8','class-9','class-10','class-11','class-12'];
    const validSubjects = ['mathematics'];

    return questions.every(q => {
      const hasRequired = requiredFields.every(field => q.hasOwnProperty(field));
      const validClass = validClassStandards.includes(q.classStandard);
      const validSubject = validSubjects.includes(q.subject || 'mathematics');
      const optionsOk = Array.isArray(q.options) && q.options.length >= 2;
      const correctOk = typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 && q.correctOptionIndex < (q.options || []).length;
      return hasRequired && validClass && validSubject && optionsOk && correctOk;
    });
  };

  const handleUploadQuestions = async () => {
    if (!jsonInput.trim()) {
      toast({ title: 'Input Required', description: 'Please paste your JSON questions data.', variant: 'destructive' });
      return;
    }

    try {
      const questions = JSON.parse(jsonInput);
      if (!Array.isArray(questions)) throw new Error('Input must be an array of questions');
      if (questions.length === 0) throw new Error('Questions array cannot be empty');
      if (!validateQuestionFormat(questions)) throw new Error('Some questions have invalid format. Check required fields and enums.');

      const result = await bulkUploadQuestions({ questions }).unwrap();
      setLastUploadResult({ success: true, ...result });
      toast({ title: 'Success', description: `${result.count} questions uploaded and assigned successfully!` });
      setJsonInput('');
    } catch (error: any) {
      console.error('Upload failed:', error);
      const msg = error?.data?.message || error?.message || 'Unknown error';
      setLastUploadResult({ success: false, message: msg });
      toast({ title: 'Upload Failed', description: msg, variant: 'destructive' });
    }
  };

  const sampleJson = `[
  {
    "questionText": "What is 2+3?",
    "options": ["3","4","5","6"],
    "correctOptionIndex": 2,
    "classStandard": "class-6",
    "subject": "mathematics",
    "chapter": "Numbers",
    "topic": "Addition",
    "questionType": "multiple-choice",
    "difficulty": "easy"
  }
]`;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="mr-3 h-8 w-8 text-blue-600" />
          Bulk Math Question Upload
        </h1>
        <p className="text-gray-600">Upload multiple math MCQ questions in JSON format and assign them to class standards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Upload className="mr-2 h-5 w-5"/>JSON Questions Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">Paste JSON Questions Array</Label>
              <Textarea id="json-input" placeholder="Paste your JSON array of math MCQ questions here..." value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={12} className="font-mono text-sm" />
            </div>
            <Button onClick={handleUploadQuestions} disabled={isUploading || !jsonInput.trim()} className="w-full">
              {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Uploading...</>) : (<><Upload className="mr-2 h-4 w-4"/>Upload Questions</>) }
            </Button>

            {lastUploadResult && (
              <div className={`p-4 rounded-lg border ${lastUploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start">
                  {lastUploadResult.success ? (<CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5"/>) : (<AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5"/>)}
                  <div>
                    <p className={`font-medium ${lastUploadResult.success ? 'text-green-800' : 'text-red-800'}`}>{lastUploadResult.success ? 'Upload Successful' : 'Upload Failed'}</p>
                    <p className={`text-sm ${lastUploadResult.success ? 'text-green-600' : 'text-red-600'}`}>{lastUploadResult.message}</p>
                    {lastUploadResult.success && lastUploadResult.count && (<p className="text-sm text-green-600 mt-1">Questions saved and assigned to classes.</p>)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sample JSON Format</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Use this format for your math MCQ questions.</p>
              <div className="bg-gray-50 p-4 rounded-lg"><pre className="text-xs overflow-x-auto"><code>{sampleJson}</code></pre></div>
              <Button variant="outline" size="sm" onClick={() => setJsonInput(sampleJson)} className="w-full">Use Sample Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
