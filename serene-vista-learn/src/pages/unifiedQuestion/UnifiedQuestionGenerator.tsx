import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TextWithMath } from '@/components/ui/TextWithMath';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Upload } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetSubjectsQuery, useGetClassesQuery, useGetChaptersQuery, useGenerateUnifiedQuestionsMutation, useBulkUploadQuestionsMutation } from '@/state/api/questionManagerApi';

export default function UnifiedQuestionGenerator() {
  // start empty so we can pick defaults from API responses
  const [subject, setSubject] = useState('');
  const [classStandard, setClassStandard] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [num, setNum] = useState(10);
  const [questionType, setQuestionType] = useState('mcq');
  // loading state is handled by RTK Query (isGenerating)
  const [result, setResult] = useState<any>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [chaptersList, setChaptersList] = useState<string[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter?: number, message?: string } | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const maxRetryAttempts = 5;

  const user = useSelector((state:any) => state.auth?.user);

  // RTK Query hooks for subjects, classes, chapters
  const { data: subjectsData } = useGetSubjectsQuery();
  const { data: classesData } = useGetClassesQuery();
  const { data: chaptersData } = useGetChaptersQuery({ subject, classStandard }, { skip: !subject || !classStandard });

  React.useEffect(() => { if (subjectsData) setSubjects(subjectsData.data || subjectsData); }, [subjectsData]);
  React.useEffect(() => { if (classesData) setClasses(classesData.data || classesData); }, [classesData]);
  React.useEffect(() => { if (chaptersData) setChaptersList(chaptersData.data || chaptersData); }, [chaptersData]);

  // set sensible defaults once we have fetched options
  React.useEffect(() => {
    if (subjects.length > 0 && !subject) setSubject(subjects[0]);
  }, [subjects]);

  React.useEffect(() => {
    if (classes.length > 0 && !classStandard) setClassStandard(classes[0]);
  }, [classes]);

  React.useEffect(() => {
    // chapter will be entered by the user as comma-separated values; don't auto-set from chaptersList
  }, [chaptersList]);

  const [generateUnified, { isLoading: isGenerating }] = useGenerateUnifiedQuestionsMutation();
  const [bulkUpload] = useBulkUploadQuestionsMutation();

  const handleGenerate = async () => {
    setRateLimitInfo(null);
    try {
  const payload = { subject, classStandard, chapter, topic, numberOfQuestions: num, questionType };
  console.debug('generate request payload:', payload);
  const resp = await generateUnified(payload).unwrap();
  // Normalize response shapes coming from server / provider
  const normalized = normalizeGenerateResponse(resp);
  console.debug('generate resp raw:', resp, 'normalized:', normalized);
  setResult(normalized);
    } catch (err:any) {
  console.error('generate request error:', err);
      if (err?.status === 429) {
        const ra = Number(err?.data?.retryAfter || err?.meta?.retryAfter || 5);
        setRateLimitInfo({ retryAfter: ra, message: err?.data?.message || 'Rate limited' });
        startAutoRetry(() => handleGenerate(), ra);
      }
      setResult({ success: false, error: err?.data?.message || err?.error || err?.statusText || 'Generation failed' });
    }
  };

  // Normalize generator responses from backend which may wrap payloads differently
  const normalizeGenerateResponse = (resp:any) => {
    if (!resp) return resp;
    // Common case: { success: true, questions: [...] }
    if (resp.success && Array.isArray(resp.questions)) return resp;

    // Case: RTK / server wraps under `data`
    if (resp.data) {
      // data.questions or data may itself be the questions array
      if (Array.isArray(resp.data.questions)) return { success: true, questions: resp.data.questions, costEstimate: resp.data.costEstimate || resp.costEstimate };
      if (Array.isArray(resp.data)) return { success: true, questions: resp.data };
      // sometimes server returns { data: { result: { questions: [...] } } }
      if (resp.data.result && Array.isArray(resp.data.result.questions)) return { success: true, questions: resp.data.result.questions, costEstimate: resp.data.result.costEstimate };
    }

    // If server returned a rawResponse string with JSON inside, try parse it
    if (typeof resp.rawResponse === 'string') {
      try {
        const parsed = JSON.parse(resp.rawResponse);
        if (parsed && Array.isArray(parsed.questions)) return { success: true, questions: parsed.questions, costEstimate: parsed.costEstimate };
        if (Array.isArray(parsed)) return { success: true, questions: parsed };
      } catch (e) {
        // ignore parse errors
      }
    }

    // Fallback: if resp.questions exists but not array, try to coerce
    if (resp.questions && !Array.isArray(resp.questions) && typeof resp.questions === 'object') {
      const arr = Array.isArray((resp.questions as any).items) ? (resp.questions as any).items : Object.values(resp.questions);
      return { success: true, questions: arr };
    }

    return resp;
  };

  const toggleSelect = (idx:number) => {
    const s = new Set(selected);
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    setSelected(s);
  };

  const handleBulkUpload = async () => {
    if (!result || !result.questions || result.questions.length === 0) return;
    const toUpload = Array.from(selected).map(i => result.questions[i]);
    if (toUpload.length === 0) return alert('Select at least one question to upload');
    setUploading(true);
    setRateLimitInfo(null);
    try {
  console.debug('bulk upload payload:', { questions: toUpload });
  const resp = await bulkUpload({ questions: toUpload }).unwrap();
  console.debug('bulk upload resp raw:', resp);
  alert('Bulk upload succeeded');
      setSelected(new Set());
    } catch (err:any) {
  console.error('bulk upload error:', err);
      if (err?.status === 429) {
        const ra = Number(err?.data?.retryAfter || err?.meta?.retryAfter || 5);
        setRateLimitInfo({ retryAfter: ra, message: err?.data?.message || 'Rate limited' });
        startAutoRetry(() => handleBulkUpload(), ra);
      }
      setResult({ success: false, error: err?.data?.message || err?.error || 'Bulk upload failed' });
      alert('Bulk upload failed: ' + (err?.data?.message || err?.error || 'Bulk upload failed'));
    } finally { setUploading(false); }
  };

  // Auto retry helper with exponential backoff and countdown
  const startAutoRetry = (fn: ()=>Promise<void>, initialWait = 5) => {
    let attempts = 0;
    let wait = Math.max(1, Math.floor(initialWait));
    if (retrying) return; // already retrying
    setRetrying(true);
    setRetryCountdown(wait);

    const tick = () => {
      setRetryCountdown((prev) => {
        if (!prev || prev <= 1) {
          // time to attempt
          attempts += 1;
          fn().finally(() => {
            // if function succeeds, it will set result; we still check attempts
          }).catch(()=>{});
          if (attempts >= maxRetryAttempts) {
            setRetrying(false);
            setRetryCountdown(null);
            return null;
          }
          // next wait = exponential
          wait = wait * 2;
          setRetryCountdown(wait);
          return wait;
        }
        return prev - 1;
      });
    };

    // start an interval
    const iv = setInterval(() => {
      setRetryCountdown(rc => {
        if (rc === null) return null;
        if (rc <= 1) {
          // attempt now
          // call tick to handle attempt and schedule next
          tick();
          return wait; // next wait already set in tick
        }
        return rc - 1;
      });
    }, 1000);

    // canceler
    const stop = () => {
      clearInterval(iv);
      setRetrying(false);
      setRetryCountdown(null);
    };

    // attach to window so we can cancel from UI (small hack but fine for admin tool)
    (window as any).__unifiedRetryCancel = stop;
  };

  const cancelRetry = () => {
    const f = (window as any).__unifiedRetryCancel;
    if (f) f();
  };

  // admin check disabled for now — show page to any logged-in user

  return (
    <div className="p-6" data-active="admin-unified-generator">
      <h2 className="text-xl font-semibold mb-4">Unified Question Generator</h2>
      <Card className="space-y-2">
        <CardHeader>
          <CardTitle>Generate and Preview</CardTitle>
        </CardHeader>
        <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label>Subject</label>
          <Select value={subject} onValueChange={(v:any)=>setSubject(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label>Class</label>
          <Select value={classStandard} onValueChange={(v:any)=>setClassStandard(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label>Chapter(s) (comma-separated)</label>
          <Input value={chapter} onChange={(e:any)=>setChapter(e.target.value)} placeholder="e.g. Chapter 1, Chapter 2" />
        </div>
        <div>
          <label>Topic (optional)</label>
          <Input value={topic} onChange={(e:any)=>setTopic(e.target.value)} />
        </div>
        <div>
          <label>Number of Questions</label>
          <Input type="number" value={num} onChange={(e:any)=>setNum(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Type</label>
          <Select value={questionType} onValueChange={(v:any)=>setQuestionType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="fillin">Fill in the blank (coming soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <Button onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center">
          <Rocket className="size-4" />
          {isGenerating? 'Generating...':'Generate'}
        </Button>
      </div>

      <div className="mt-6">
        {!result && <div className="text-sm text-gray-500">No result yet</div>}
        {result && result.success === false && (
          <div className="p-4 bg-red-50 rounded">
            <strong>Error:</strong> {result.error || 'Unknown error'}
            {result.rawResponse && (
              <details className="mt-2"><summary>Raw response</summary><pre className="text-xs">{result.rawResponse}</pre></details>
            )}
          </div>
        )}

        {result && result.success && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <strong>{result.questions?.length ?? 0}</strong> questions generated.
                {result.costEstimate && (
                  <span className="ml-3 text-sm text-gray-600">Estimated cost: ${result.costEstimate.estimatedCostUsd.toFixed(4)} (tokens: {result.costEstimate.tokenCount})</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleBulkUpload} disabled={uploading || selected.size===0} variant="secondary">
                  <Upload className="size-4" />
                  {uploading? 'Uploading...':'Bulk Upload Selected'}
                </Button>
                <Link to="/admin/dashboard/bulk-upload" className="text-sm text-blue-600">Go to Bulk Upload</Link>
              </div>
            </div>

            {rateLimitInfo && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
                <div>
                  <strong>Rate limit:</strong> {rateLimitInfo.message} {rateLimitInfo.retryAfter ? `(initial wait ${rateLimitInfo.retryAfter}s)` : ''}
                  {retryCountdown !== null && <div className="text-sm text-gray-600 mt-1">Retrying in {retryCountdown}s...</div>}
                  {retrying && <div className="text-sm text-gray-600 mt-1">Attempting automatic retries...</div>}
                </div>
                <div className="flex items-center space-x-2">
                  {retrying ? (
                    <Button size="sm" variant="ghost" onClick={cancelRetry}>Cancel</Button>
                  ) : (
                    <Button size="sm" onClick={() => { if (result && result.questions) handleBulkUpload(); else handleGenerate(); }}>Retry now</Button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(result.questions || []).map((q:any, idx:number) => (
                <div key={idx} className="p-3 border rounded flex items-start space-x-3">
                  <div>
                    <Checkbox checked={selected.has(idx)} onCheckedChange={()=>toggleSelect(idx)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 mb-1"><TextWithMath>{q.questionText}</TextWithMath></div>
                    {q.options && q.options.length > 0 && (
                      <ul className="text-sm grid grid-cols-2 gap-2">
                        {q.options.map((opt:string,i:number) => (
                          <li key={i} className={`p-2 rounded ${opt===q.correctAnswer || i===q.correctOptionIndex ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'}`}><TextWithMath>{opt}</TextWithMath></li>
                        ))}
                      </ul>
                    )}
                    {q.answer && (
                      <div className="mt-2 text-xs text-gray-600">Answer: <TextWithMath>{q.answer}</TextWithMath></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
        </CardContent>
      </Card>
    </div>
  );
}
