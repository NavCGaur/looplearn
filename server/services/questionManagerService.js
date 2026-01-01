import AssignedQuestion from '../models/assignedQuestion.js';
import ScienceQuestion from '../models/scienceQuestionSchema.js';
import MathQuestion from '../models/mathQuestionSchema.js';

/**
 * Assign questions to a class/subject/chapter. Returns per-id status.
 */
export const assignQuestions = async ({ subject, classStandard, chapter = null, questionIds = [], assignedBy = null }) => {
  if (!subject || !classStandard || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error('subject, classStandard and questionIds are required');
  }

  const results = { assigned: [], skipped: [], errors: [] };

  try {
    // Verify questions exist in the appropriate collection
    let validQuestionIds = [];
    
    for (const qid of questionIds) {
      try {
        let questionData = null;
        if (subject.toLowerCase().includes('sci') || subject === 'science' || subject === 'physics' || subject === 'chemistry' || subject === 'biology') {
          questionData = await ScienceQuestion.findById(qid).lean();
        } else if (subject.toLowerCase().includes('math') || subject === 'mathematics') {
          questionData = await MathQuestion.findById(qid).lean();
        }

        if (questionData) {
          // Use chapter from question data if not provided in request
          const finalChapter = chapter || questionData.chapter || null;
          validQuestionIds.push({ id: qid, chapter: finalChapter });
        } else {
          results.errors.push({ id: qid, message: 'Question not found in subject collection' });
        }
      } catch (err) {
        results.errors.push({ id: qid, message: err.message });
      }
    }

    // Group questions by chapter for efficient batch operations
    const questionsByChapter = validQuestionIds.reduce((acc, { id, chapter: qChapter }) => {
      const chapterKey = chapter || qChapter || null;
      if (!acc[chapterKey]) acc[chapterKey] = [];
      acc[chapterKey].push(id);
      return acc;
    }, {});

    // Process each chapter group
    for (const [chapterKey, chapterQuestionIds] of Object.entries(questionsByChapter)) {
      try {
        const finalChapter = chapterKey === 'null' ? null : chapterKey;
        
        // Use the new addQuestions method for efficient batch operation
        await AssignedQuestion.addQuestions(classStandard, subject, finalChapter, chapterQuestionIds);
        
        results.assigned.push(...chapterQuestionIds);
      } catch (err) {
        // Handle duplicate key errors gracefully
        if (err.code === 11000) {
          results.skipped.push(...chapterQuestionIds);
        } else {
          chapterQuestionIds.forEach(id => {
            results.errors.push({ id, message: err.message });
          });
        }
      }
    }

  } catch (err) {
    throw new Error(`Failed to assign questions: ${err.message}`);
  }

  return results;
};

export const deassignQuestions = async ({ subject, classStandard, chapter = null, questionIds = [] }) => {
  if (!subject || !classStandard || !Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error('subject, classStandard and questionIds are required');
  }

  try {
    // If chapter is specified, remove from that specific chapter assignment
    if (chapter) {
      await AssignedQuestion.removeQuestions(classStandard, subject, chapter, questionIds);
    } else {
      // If no chapter specified, remove from all chapters for this class+subject
      const assignments = await AssignedQuestion.find({ classStandard, subject }).lean();
      
      for (const assignment of assignments) {
        await AssignedQuestion.removeQuestions(classStandard, subject, assignment.chapter, questionIds);
      }
    }

    return { removedCount: questionIds.length };
  } catch (err) {
    throw new Error(`Failed to deassign questions: ${err.message}`);
  }
};

export const listAssigned = async ({ subject, classStandard, chapter = null, page = 1, limit = 20 }) => {
  const query = { subject, classStandard };
  if (chapter) query.chapter = chapter;

  // Get assignment documents
  const assignments = await AssignedQuestion.find(query).lean();
  
  // Extract all question IDs from the assignments
  const allQuestionIds = assignments.reduce((acc, assignment) => {
    return acc.concat(assignment.questionIds || []);
  }, []);

  // Remove duplicates and apply pagination
  const uniqueQuestionIds = [...new Set(allQuestionIds)];
  const total = uniqueQuestionIds.length;
  const skip = (page - 1) * limit;
  const paginatedQuestionIds = uniqueQuestionIds.slice(skip, skip + limit);

  // Enrich with question details
  const enriched = await Promise.all(paginatedQuestionIds.map(async (questionId) => {
    let question = null;
    try {
      if (subject.toLowerCase().includes('math') || subject === 'mathematics') {
        question = await MathQuestion.findById(questionId).lean();
      } else {
        question = await ScienceQuestion.findById(questionId).lean();
      }
    } catch (e) {
      question = null;
    }
    
    // Find which assignment document contains this question to get metadata
    const assignment = assignments.find(a => a.questionIds.includes(questionId));
    
    return { 
      _id: questionId, // Use questionId as document ID for compatibility
      questionId,
      subject,
      classStandard,
      chapter: assignment?.chapter || question?.chapter || null,
      assignedAt: assignment?.createdAt || assignment?.lastModified,
      question 
    };
  }));

  return {
    items: enriched,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Return distinct subjects that appear in question collections.
 */
export const listSubjects = async () => {
  try {
    const mathSubjects = await MathQuestion.distinct('subject');
    const scienceSubjects = await ScienceQuestion.distinct('subject');
    const allSubjects = [...mathSubjects, ...scienceSubjects];
    return [...new Set(allSubjects)].filter(Boolean).sort();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return ['mathematics', 'science']; // fallback with consistent naming
  }
};

/**
 * Return distinct classStandards that appear in question collections.
 */
export const listClasses = async () => {
  try {
    const mathClasses = await MathQuestion.distinct('classStandard');
    const scienceClasses = await ScienceQuestion.distinct('classStandard');
    const allClasses = [...mathClasses, ...scienceClasses];
    return [...new Set(allClasses)].filter(Boolean).sort();
  } catch (error) {
    console.error('Error fetching classes:', error);
    return ['class-9', 'class-10']; // fallback
  }
};

/**
 * Return distinct chapters. Optional filters: subject, classStandard.
 */
export const listChapters = async ({ subject = null, classStandard = null } = {}) => {
  try {
    const query = {};
    if (subject) query.subject = subject;
    if (classStandard) query.classStandard = classStandard;
    
    let chapters = [];
    
    // Query both collections based on subject filter
    if (!subject || subject.toLowerCase().includes('math') || subject === 'mathematics') {
      const mathChapters = await MathQuestion.distinct('chapter', query);
      chapters = [...chapters, ...mathChapters];
    }
    
    if (!subject || subject.toLowerCase().includes('science') || subject === 'science' || subject === 'physics' || subject === 'chemistry' || subject === 'biology') {
      const scienceChapters = await ScienceQuestion.distinct('chapter', query);
      chapters = [...chapters, ...scienceChapters];
    }
    
    return [...new Set(chapters)].filter(Boolean).sort();
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

// Unified bulk upload across subjects (math/science)
export const bulkUploadQuestions = async (questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) throw new Error('questions array required');

  // Partition questions by subject
  const bySubject = questions.reduce((acc, q) => {
    const subj = (q.subject || 'science').toLowerCase();
    acc[subj] = acc[subj] || [];
    acc[subj].push(q);
    return acc;
  }, {});

  const results = {};
  // Lazy import to avoid cycles
  if (bySubject['mathematics'] || bySubject['math']) {
    const { bulkUploadQuestionsService: mathBulk } = await import('./math/mathService.js');
    const mathQs = bySubject['mathematics'] || bySubject['math'];
    try {
      results.math = await mathBulk(mathQs);
    } catch (err) {
      results.math = { error: err.message };
    }
  }

  if (bySubject['science'] || bySubject['physics'] || bySubject['chemistry'] || bySubject['biology']) {
    const { bulkUploadQuestionsService: scienceBulk } = await import('./science/scienceService.js');
    const scienceQs = bySubject['science'] || bySubject['physics'] || bySubject['chemistry'] || bySubject['biology'];
    try {
      results.science = await scienceBulk(scienceQs);
    } catch (err) {
      results.science = { error: err.message };
    }
  }

  return results;
};
