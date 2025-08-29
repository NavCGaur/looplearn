import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useGenerateQuestionsMutation, useSaveSelectedQuestionsMutation, useAssignNewQuestionsMutation } from '@/state/api/mathApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function MathQuestionGenerator() {
  const { toast } = useToast();
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignClass, setAssignClass] = useState('');
    const [assignNewQuestions] = useAssignNewQuestionsMutation();

  const [generateQuestions] = useGenerateQuestionsMutation();
  const [saveSelectedQuestions] = useSaveSelectedQuestionsMutation();

  const { register, handleSubmit } = useForm({ defaultValues: { classStandard: '', subject: 'mathematics', chapter: '', topic: '', numberOfQuestions: 5 } });

  const onGenerate = async (data: any) => {
    setIsGenerating(true);
    try {
      const response = await generateQuestions(data).unwrap();
      setGeneratedQuestions(response.questions || []);
      setSelected(new Set());
      toast({ title: 'Generated', description: `Generated ${response.questions?.length || 0} questions` });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to generate' , variant: 'destructive'});
    } finally { setIsGenerating(false); }
  };

  const toggleSelect = (i: number) => {
    const s = new Set(selected);
    if (s.has(i)) s.delete(i); else s.add(i);
    setSelected(s);
  };

  const onSaveSelected = async () => {
    const selectedQs = Array.from(selected).map(i => generatedQuestions[i]);
    if (selectedQs.length === 0) { toast({ title: 'No selection', description: 'Select at least one question', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      // API expects an array of full question objects to save
      const result: any = await saveSelectedQuestions(selectedQs).unwrap();
      toast({ title: 'Saved', description: `Saved ${selectedQs.length} questions` });
      // If backend returns saved question docs, open assign modal
      const savedIds = (result.savedQuestions || result.questions || []).map((q: any) => q._id || q.id).filter(Boolean);
      if (savedIds.length) {
        // store ids on generatedQuestions temporarily for assignment
        // open assign modal
        setAssignClass('');
        (window as any).__pendingAssignIds = savedIds;
        setIsAssignOpen(true);
      }
      setSelected(new Set());
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || 'Failed to save', variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  const onOpenPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const onAssign = async () => {
    const ids = (window as any).__pendingAssignIds || [];
    if (!assignClass) { toast({ title: 'Select class', description: 'Choose a class standard to assign', variant: 'destructive' }); return; }
    try {
      const res = await assignNewQuestions({ classStandard: assignClass, questionIds: ids }).unwrap();
      toast({ title: 'Assigned', description: `Assigned ${res.addedCount || ids.length} questions to ${assignClass}` });
      setIsAssignOpen(false);
      (window as any).__pendingAssignIds = [];
    } catch (err: any) {
      toast({ title: 'Assign failed', description: err?.message || 'Failed to assign', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Generate Math MCQs</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onGenerate)} className="space-y-3">
              <div>
                <label className="text-sm">Class Standard</label>
                <Select {...register('classStandard') as any}>
                  <SelectTrigger><SelectValue placeholder="Select Class"/></SelectTrigger>
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
              </div>

              <div>
                <label className="text-sm">Chapter</label>
                <Input {...register('chapter')} />
              </div>

              <div>
                <label className="text-sm">Topic</label>
                <Input {...register('topic')} />
              </div>

              <div>
                <label className="text-sm">Number of Questions</label>
                <Input type="number" {...register('numberOfQuestions')} />
              </div>

              <Button type="submit" disabled={isGenerating} className="w-full">{isGenerating ? 'Generating...' : 'Generate'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {generatedQuestions.length === 0 ? (
            <Card><CardContent>No questions generated yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {generatedQuestions.map((q, i) => (
                <Card key={i}><CardContent>
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-start">
                      <Checkbox checked={selected.has(i)} onCheckedChange={() => toggleSelect(i)} />
                      <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => onOpenPreview(i)}>Preview</Button>
                    </div>
                    <div>
                      <div className="font-medium">Q{i+1}: {q.questionText}</div>
                      <ul className="list-disc pl-6 mt-2">
                        {(q.options || []).map((opt: string, idx: number) => (
                          <li key={idx} className={`py-1 ${q.correctOptionIndex === idx ? 'font-semibold text-green-700' : ''}`}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent></Card>
              ))}

              <div className="flex space-x-2">
                <Button onClick={onSaveSelected} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Selected'}</Button>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {previewIndex !== null && generatedQuestions[previewIndex] && (
                <div>
                  <h3 className="font-medium mb-2">{generatedQuestions[previewIndex].questionText}</h3>
                  <ol className="list-decimal pl-6">
                    {(generatedQuestions[previewIndex].options || []).map((o: string, i: number) => (
                      <li key={i} className={generatedQuestions[previewIndex].correctOptionIndex === i ? 'font-semibold text-green-700' : ''}>{o}</li>
                    ))}
                  </ol>
                  <p className="text-sm text-gray-500 mt-3">Topic: {generatedQuestions[previewIndex].topic} • Chapter: {generatedQuestions[previewIndex].chapter}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Saved Questions to Class</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-3">
              <label className="text-sm">Select Class</label>
              <Select onValueChange={(v: any) => setAssignClass(v)}>
                <SelectTrigger><SelectValue placeholder="Select Class"/></SelectTrigger>
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
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                <Button onClick={onAssign}>Assign</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
