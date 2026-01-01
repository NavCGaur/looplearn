import React, { useEffect, useState } from 'react';
import { useListAssignedQuery, useAssignMutation, useDeassignMutation } from '@/state/api/questionsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TextWithMath } from '@/components/ui/TextWithMath';
import { useToast } from '@/hooks/use-toast';

const QuestionManager: React.FC = () => {
  const [classStandard, setClassStandard] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Fetch meta (subjects/classes) once on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
  const s = await fetch('/api/question-manager/subjects');
        if (s.ok && (s.headers.get('content-type') || '').includes('application/json')) {
          const sj = await s.json();
          if (sj && sj.success && Array.isArray(sj.data) && sj.data.length) {
            setSubjects(sj.data);
          } else {
            console.debug('No subjects found in database, using defaults');
          }
        }
      } catch (e) {
        console.debug('Failed to fetch subjects', e);
      }

      try {
  const c = await fetch('/api/question-manager/classes');
        if (c.ok && (c.headers.get('content-type') || '').includes('application/json')) {
          const cj = await c.json();
          if (cj && cj.success && Array.isArray(cj.data) && cj.data.length) {
            setClasses(cj.data);
            // If no class selected yet, choose the first available class (user still must click Load Questions)
            setClassStandard(prev => prev || (Array.isArray(cj.data) && cj.data.length ? cj.data[0] : ''));
          } else {
            console.debug('No classes found in database, using defaults');
          }
        }
      } catch (e) {
        console.debug('Failed to fetch classes', e);
      }
    };

    fetchMeta();
  }, []);

  // Filter subjects based on selected class
  useEffect(() => {
    if (!classStandard) {
      setFilteredSubjects([]);
      return;
    }
    
    const fetchSubjectsForClass = async () => {
      try {
  // Get chapters for this class across all subjects to determine available subjects
  const availableSubjects = new Set<string>();
        
        const scienceFamily = new Set(['science', 'physics', 'chemistry', 'biology', 'social-science']);
        for (const subj of subjects) {
          const endpointSubject = (subj === 'mathematics' || subj === 'math') ? 'math' : (scienceFamily.has(subj) ? 'science' : subj);
          try {
            const resp = await fetch(`/api/${endpointSubject}/filter-questions?classStandard=${encodeURIComponent(classStandard)}&limit=1`);
            if (resp.ok) {
              const json = await resp.json();
              if (json && json.questions && json.questions.length > 0) {
                availableSubjects.add(subj);
              }
            }
          } catch (e) {
            console.debug(`No questions found for ${subj} ${classStandard}`);
          }
        }
        
        setFilteredSubjects(Array.from(availableSubjects));
        
        // Reset subject if current selection is not available for this class
        if (subject && !availableSubjects.has(subject)) {
          setSubject('');
        }
      } catch (e) {
        console.debug('Failed to filter subjects for class', e);
        setFilteredSubjects(subjects);
      }
    };

    fetchSubjectsForClass();
  }, [classStandard, subjects]);

  // Fetch chapters when subject or class changes
  useEffect(() => {
    if (!subject || !classStandard) {
      setChapters([]);
      return;
    }
    
    const fetchChapters = async () => {
      try {
  const q = `/api/question-manager/chapters?subject=${encodeURIComponent(subject)}&classStandard=${encodeURIComponent(classStandard)}`;
        const r = await fetch(q);
        if (r.ok && (r.headers.get('content-type') || '').includes('application/json')) {
          const j = await r.json();
          if (j && j.success && Array.isArray(j.data)) setChapters(j.data);
          else setChapters([]);
        } else {
          setChapters([]);
        }
      } catch (e) {
        console.debug('Failed to fetch chapters', e);
        setChapters([]);
      }
    };

    fetchChapters();
  }, [subject, classStandard]);

  const { data, isLoading, refetch: refetchAssigned } = useListAssignedQuery({ 
    subject: subject, // Use consistent subject name (mathematics)
    classStandard, 
    page: 1, 
    limit: 50 
  }, { skip: !isSubmitted || !subject });
  const [assign] = useAssignMutation();
  const [deassign] = useDeassignMutation();
  const { toast } = useToast();

  const items = data?.data?.items || [];
  const [available, setAvailable] = useState<any[]>([]);
  const [availLoading, setAvailLoading] = useState(false);

  // Helper function to refresh available questions
  const refreshAvailableQuestions = async () => {
    if (!subject || !classStandard) return;
    
    setAvailLoading(true);
    try {
      const scienceFamily = new Set(['science', 'physics', 'chemistry', 'biology', 'social-science']);
      const endpointSubject = (subject === 'mathematics' || subject === 'math') ? 'math' : (scienceFamily.has(subject) ? 'science' : subject);
      const params = new URLSearchParams({
        classStandard,
        limit: '100'
      });
      
      if (chapter) {
        params.append('chapter', chapter);
      }
      
      const resp = await fetch(`/api/${endpointSubject}/filter-questions?${params}`);
      const ctype = resp.headers.get('content-type') || '';
      if (resp.ok && ctype.includes('application/json')) {
        const json = await resp.json();
        if (json && json.questions) {
          setAvailable(json.questions);
        } else if (json && json.data) {
          setAvailable(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to refresh available questions', err);
    } finally {
      setAvailLoading(false);
    }
  };

  useEffect(() => {
    if (!isSubmitted || !subject) {
      setAvailable([]);
      return;
    }
    
    // fetch available questions from subject-specific endpoints (NOT assigned questions)
    refreshAvailableQuestions();
  }, [subject, classStandard, chapter, isSubmitted]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAssigned = (id: string) => {
    setSelectedAssignedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllAvailable = () => {
    const allIds = available.map(q => q.id || q._id || q.questionId).filter(Boolean);
    setSelectedIds(allIds);
  };

  const deselectAllAvailable = () => {
    setSelectedIds([]);
  };

  const selectAllAssigned = () => {
    const allIds = items.map(it => it.questionId).filter(Boolean);
    setSelectedAssignedIds(allIds);
  };

  const deselectAllAssigned = () => {
    setSelectedAssignedIds([]);
  };

  const handleSubmit = () => {
    if (!classStandard || !subject) {
      toast({ title: 'Error', description: 'Please select both class and subject', variant: 'destructive' });
      return;
    }
    setIsSubmitted(true);
    setSelectedIds([]);
    setSelectedAssignedIds([]);
  };

  const doDeassign = async () => {
    try {
      if (selectedAssignedIds.length === 0) {
        toast({ title: 'Error', description: 'No assigned questions selected for deassignment', variant: 'destructive' });
        return;
      }

      const resp = await deassign({ 
        subject: subject, // Keep original subject name (mathematics)
        classStandard,
        chapter: chapter || null,
        questionIds: selectedAssignedIds // Only use assigned question selections
      }).unwrap();
      
      toast({ title: 'Success', description: `Deassigned ${resp.result.removedCount} questions` });
      setSelectedIds([]);
      setSelectedAssignedIds([]);
      
      // Force refresh of both available and assigned questions
      await Promise.all([
        refreshAvailableQuestions(),
        refetchAssigned()
      ]);
      
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to deassign questions', variant: 'destructive' });
    }
  };

  const doAssign = async () => {
    try {
      if (selectedIds.length === 0) {
        toast({ title: 'Error', description: 'No questions selected for assignment', variant: 'destructive' });
        return;
      }

      const resp = await assign({ 
        subject: subject, // Keep original subject name (mathematics)
        classStandard,
        chapter: chapter || null,
        questionIds: selectedIds 
      }).unwrap();
      
      toast({ title: 'Success', description: `Assigned ${resp.result.assigned.length} questions` });
      setSelectedIds([]);
      
      // Force refresh of both available and assigned questions
      await Promise.all([
        refreshAvailableQuestions(),
        refetchAssigned()
      ]);
      
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to assign questions', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Question Management System</h1>
        <p className="text-gray-600">Assign and manage questions for different classes and subjects</p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filter Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Class Selection - Primary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Standard <span className="text-red-500">*</span>
              </label>
              <select 
                value={classStandard} 
                onChange={e => {
                  setClassStandard(e.target.value);
                  setSubject('');
                  setChapter('');
                  setIsSubmitted(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c.replace('-', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Subject Selection - Secondary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select 
                value={subject} 
                onChange={e => {
                  setSubject(e.target.value);
                  setChapter('');
                  setIsSubmitted(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!classStandard}
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Chapter Selection - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter (Optional)
              </label>
              <select 
                value={chapter} 
                onChange={e => {
                  setChapter(e.target.value);
                  setIsSubmitted(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!subject}
              >
                <option value="">All Chapters</option>
                {chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSubmit}
                disabled={!classStandard || !subject}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Load Questions
              </Button>
            </div>
          </div>

          {/* Status Information */}
          {isSubmitted && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing questions for: <strong>{classStandard.replace('-', ' ').toUpperCase()}</strong> - 
                <strong> {subject.charAt(0).toUpperCase() + subject.slice(1)}</strong>
                {chapter && <span> - <strong>{chapter}</strong></span>}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Top */}
      {isSubmitted && (
        <div className="mb-6 flex gap-3 justify-center">
          <Button 
            onClick={doAssign} 
            disabled={selectedIds.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            Assign Selected ({selectedIds.length})
          </Button>
          <Button 
            onClick={doDeassign} 
            disabled={selectedAssignedIds.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            Deassign Selected ({selectedAssignedIds.length})
          </Button>
        </div>
      )}

      {/* Questions Display */}
      {isSubmitted ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Available Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Questions ({available.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={selectAllAvailable}
                      variant="outline"
                      size="sm"
                      disabled={available.length === 0}
                    >
                      Select All
                    </Button>
                    <Button 
                      onClick={deselectAllAvailable}
                      variant="outline"
                      size="sm"
                      disabled={selectedIds.length === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
                  {availLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Loading available questions...</div>
                    </div>
                  ) : available.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No questions found for {subject} {classStandard}
                      {chapter && ` - ${chapter}`}
                    </div>
                  ) : (
                    available.map((q: any) => {
                      const questionId = q.id || q._id || q.questionId;
                      const questionText = q.question || q.questionText || q.text || 'No question text';
                      const questionTopic = q.topic || q.chapter || q.unit || '—';
                      
                      return (
                        <div 
                          key={questionId || Math.random()} 
                          className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                            selectedIds.includes(questionId) ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleSelect(questionId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-3">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                <TextWithMath>{questionText}</TextWithMath>
                              </div>
                              <div className="text-xs text-gray-500">{questionTopic}</div>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(questionId)} 
                              onChange={() => toggleSelect(questionId)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Assigned Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assigned Questions ({items.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={selectAllAssigned}
                      variant="outline"
                      size="sm"
                      disabled={items.length === 0}
                    >
                      Select All
                    </Button>
                    <Button 
                      onClick={deselectAllAssigned}
                      variant="outline"
                      size="sm"
                      disabled={selectedAssignedIds.length === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Loading assigned questions...</div>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No assigned questions for {subject} {classStandard}
                      {chapter && ` - ${chapter}`}
                    </div>
                  ) : (
                    items.map((it: any) => (
                      <div 
                        key={it._id} 
                        className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                          selectedAssignedIds.includes(it.questionId) ? 'bg-red-50 border-red-300' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => toggleSelectAssigned(it.questionId)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-3">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              <TextWithMath>{it.question?.questionText || it.question?.question || it.questionId}</TextWithMath>
                            </div>
                            <div className="text-xs text-gray-500">
                              {it.subject} • {it.classStandard} • {it.chapter || 'No chapter'}
                            </div>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={selectedAssignedIds.includes(it.questionId)} 
                            onChange={() => toggleSelectAssigned(it.questionId)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">Ready to Manage Questions</h3>
              <p>Select a class and subject above, then click "Load Questions" to begin</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

};

export default QuestionManager;
