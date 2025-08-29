import dotenv from 'dotenv';
dotenv.config();
import Fuse from 'fuse.js';
import MathQuestion from '../../models/mathQuestionSchema.js';
import AssignedMathQuestion from '../../models/assignedMathQuestions.js';

import { requestWithRetries } from '../../utility/geminiQuizApi.js';
import { UserSchema } from '../../models/userSchema.js';
import mongoose from 'mongoose';

const User = mongoose.model('User', UserSchema);

const callGeminiAPI = async (prompt, temperature = 0.2, maxTokens = 1500) => {
  try {
    const response = await requestWithRetries({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens: maxTokens, topP: 0.8, topK: 40 } });
    if (response?.data?.candidates?.[0]) {
      return response.data.candidates[0].content.parts[0].text;
    }
    throw new Error('Invalid response from Gemini API');
  } catch (error) {
    console.error('Gemini API Error:', error?.message || error);
    throw error;
  }
};

const getSubjectSearchArray = (subject) => {
  if (subject === 'mathematics') return ['mathematics'];
  return [subject];
};

const getDifficultyByClass = (classStandard) => {
  const classNumber = parseInt(classStandard.split('-')[1]);
  if (classNumber <= 7) return 'easy';
  if (classNumber <= 9) return 'medium';
  return 'hard';
};

export const generateQuestionsService = async (params) => {
  const { classStandard, subject, chapter, topic, questionType = 'multiple-choice', numberOfQuestions = 5 } = params;

  const existing = await searchExistingQuestions(params);
  const foundCount = existing.length;
  const remaining = Math.max(0, numberOfQuestions - foundCount);

  let generated = [];
  if (remaining > 0) {
    const systemPrompt = `You are an expert math educator. Generate exactly ${remaining} multiple-choice questions for ${subject} at ${classStandard} level for the topic ${topic} in chapter ${chapter}. Respond with JSON only in this format: {"questions":[{"questionText":"...","options":["opt1","opt2","opt3","opt4"],"correctOptionIndex":1,"explanation":"..."}]} `;

    const raw = await callGeminiAPI(systemPrompt, 0.3, 2000);
    let parsed;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse AI response for math generation', e, raw);
      throw new Error('Failed to parse AI response');
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error('Invalid AI response format');

    generated = parsed.questions.map((q, idx) => ({
      questionText: q.questionText,
      options: q.options || [],
      correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
      answer: q.options && q.options[q.correctOptionIndex] ? q.options[q.correctOptionIndex] : (q.answer || ''),
      classStandard,
      subject,
      chapter,
      topic,
      questionType,
      difficulty: getDifficultyByClass(classStandard),
      metadata: { generationMethod: 'ai-generated', aiModel: 'gemini', generatedAt: new Date(), index: foundCount + idx + 1 }
    }));

    try {
      const saved = await MathQuestion.insertMany(generated);
      generated = saved.map(s => s.toObject());
    } catch (e) {
      console.error('Failed to save generated math questions', e);
    }
  }

  const all = [
    ...existing.map(q => ({ _id: q._id, questionText: q.questionText, options: q.options, correctOptionIndex: q.correctOptionIndex, questionType: q.questionType, difficulty: q.difficulty, subject: q.subject, chapter: q.chapter, topic: q.topic })),
    ...generated
  ];

  return { questions: all.slice(0, numberOfQuestions), totalGenerated: all.length, existingCount: foundCount, newlyGenerated: generated.length };
};

const searchExistingQuestions = async (params) => {
  try {
    const { classStandard, subject, chapter, questionType } = params;
    const subjectArray = getSubjectSearchArray(subject);
    const candidates = await MathQuestion.find({ classStandard, subject: { $in: subjectArray }, questionType }).lean();
    if (!chapter || candidates.length === 0) return candidates;
    const fuse = new Fuse(candidates, { keys: ['chapter'], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 2 });
    const results = fuse.search(chapter).map(r => r.item);
    return results;
  } catch (e) {
    console.error('Error searching existing math questions', e);
    return [];
  }
};

export const saveQuestionsService = async (questions) => {
  const saved = [];
  let duplicates = 0;
  for (const q of questions) {
    try {
      const exists = await MathQuestion.findOne({ questionText: q.questionText, answer: q.answer, isActive: true });
      if (exists) { duplicates++; continue; }
      const newQ = new MathQuestion({ ...q, metadata: { ...(q.metadata||{}), savedAt: new Date() } });
      const s = await newQ.save();
      saved.push(s);
    } catch (e) {
      console.error('Error saving math question', e);
    }
  }
  return { savedQuestions: saved, savedCount: saved.length, duplicates };
};

export const getQuestionsByFiltersService = async (filters, options) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const query = { isActive: { $ne: false } };
    if (filters.classStandard) query.classStandard = filters.classStandard;
    if (filters.subject) query.subject = filters.subject;
    if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
    if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
    if (filters.questionType) query.questionType = filters.questionType;
    if (filters.search) {
      query.$or = [ { questionText: new RegExp(filters.search, 'i') }, { answer: new RegExp(filters.search, 'i') }, { chapter: new RegExp(filters.search, 'i') }, { topic: new RegExp(filters.search, 'i') } ];
    }
    const questions = await MathQuestion.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const totalQuestions = await MathQuestion.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);
    return { questions, totalQuestions, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  } catch (error) {
    console.error('Error in getQuestionsByFiltersService (math)', error);
    throw error;
  }
};

export const updateQuestionService = async (questionId, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) throw new Error('Invalid question ID');
    const updated = await MathQuestion.findByIdAndUpdate(questionId, { ...updateData, updatedAt: new Date() }, { new: true, runValidators: true });
    return updated;
  } catch (error) {
    console.error('Error in updateQuestionService (math)', error);
    throw error;
  }
};

export const deleteQuestionService = async (questionId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) throw new Error('Invalid question ID');
    const deleted = await MathQuestion.findByIdAndUpdate(questionId, { isActive: false, deletedAt: new Date() }, { new: true });
    return deleted;
  } catch (error) {
    console.error('Error in deleteQuestionService (math)', error);
    throw error;
  }
};

export const bulkUploadQuestionsService = async (questions) => {
  try {
    const validated = questions.map(q => ({
      questionText: q.questionText,
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex || 0,
      answer: q.answer || (q.options ? q.options[q.correctOptionIndex] : ''),
      classStandard: q.classStandard,
      subject: q.subject || 'mathematics',
      chapter: q.chapter,
      topic: q.topic,
      questionType: q.questionType || 'multiple-choice',
      difficulty: q.difficulty || 'medium'
    }));

    const savedQuestions = await MathQuestion.insertMany(validated);

    const questionsByClass = savedQuestions.reduce((acc, question) => {
      const cls = question.classStandard;
      acc[cls] = acc[cls] || [];
      acc[cls].push(question._id);
      return acc;
    }, {});

    const assignmentPromises = Object.entries(questionsByClass).map(async ([classStandard, questionIds]) => {
      let assignment = await AssignedMathQuestion.findOne({ classStandard });
      if (assignment) {
        const newIds = questionIds.filter(id => !assignment.questionIds.some(existingId => existingId.equals(id)));
        if (newIds.length) { assignment.questionIds.push(...newIds); assignment.updatedAt = new Date(); await assignment.save(); }
        return assignment;
      } else {
        const newA = new AssignedMathQuestion({ classStandard, questionIds, assignedAt: new Date() });
        await newA.save();
        return newA;
      }
    });

    const assignments = await Promise.all(assignmentPromises);

    return { count: savedQuestions.length, questions: savedQuestions, assignments, assignmentCount: assignments.length };
  } catch (error) {
    console.error('bulkUploadQuestionsService error', error);
    throw error;
  }
};

export const fetchAssignedMathQuestions = async (classStandard) => {
  const assignment = await AssignedMathQuestion.findOne({ classStandard });
  if (!assignment || !assignment.questionIds.length) return [];
  const questions = await MathQuestion.find({ _id: { $in: assignment.questionIds } });
  return questions.map(q => ({ id: q._id, question: q.questionText, type: q.questionType, options: q.options || [], correctAnswer: q.answer }));
};

export const getMathQuizQuestionsService = async (uid) => {
  const user = await User.findOne({ uid }).select('classStandard');
  if (!user) throw new Error('User not found');
  const questions = await MathQuestion.aggregate([
    { $match: { classStandard: user.classStandard, isActive: { $ne: false } } },
    { $sample: { size: 10 } },
    { $project: { _id: 1, questionText: 1, options: 1, correctOptionIndex: 1, questionType: 1, difficulty: 1, subject: 1, chapter: 1, topic: 1 } }
  ]);
  if (!questions.length) throw new Error('No math questions found for this class standard');
  return questions.map(q => ({ id: q._id.toString(), type: q.questionType, question: q.questionText, options: q.options || [], correctOption: q.correctOptionIndex, difficulty: q.difficulty, subject: q.subject }));
};

export const assignQuestionsToClassService = async (classStandard, newQuestionIds) => {
  const existingAssignment = await AssignedMathQuestion.findOne({ classStandard });
  let updatedQuestionIds;
  if (existingAssignment) {
    const existingIds = new Set(existingAssignment.questionIds.map(id => id.toString()));
    const uniqueNewIds = newQuestionIds.filter(id => !existingIds.has(id.toString()));
    updatedQuestionIds = [...existingAssignment.questionIds, ...uniqueNewIds];
  } else {
    updatedQuestionIds = newQuestionIds;
  }
  const updatedAssignment = await AssignedMathQuestion.findOneAndUpdate({ classStandard }, { questionIds: updatedQuestionIds, assignedAt: new Date() }, { upsert: true, new: true });
  return { classStandard, addedCount: updatedQuestionIds.length - (existingAssignment?.questionIds.length || 0), totalCount: updatedQuestionIds.length };
};

export const getAssignedQuestionsService = async (classStandard, filters = {}, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const assignment = await AssignedMathQuestion.findOne({ classStandard });
  if (!assignment || !assignment.questionIds.length) return { questions: [], totalQuestions: 0, totalPages: 0, hasNext: false, hasPrev: false };
  const query = { _id: { $in: assignment.questionIds }, isActive: { $ne: false } };
  if (filters.subject) query.subject = filters.subject;
  if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
  if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
  if (filters.questionType) query.questionType = filters.questionType;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.search) query.$or = [ { questionText: new RegExp(filters.search, 'i') }, { answer: new RegExp(filters.search, 'i') }, { chapter: new RegExp(filters.search, 'i') }, { topic: new RegExp(filters.search, 'i') } ];
  const totalQuestions = await MathQuestion.countDocuments(query);
  const totalPages = Math.ceil(totalQuestions / limit);
  const questions = await MathQuestion.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  return { questions, totalQuestions, totalPages, hasNext: page < totalPages, hasPrev: page > 1, assignment: { classStandard: assignment.classStandard, assignedAt: assignment.assignedAt, totalAssigned: assignment.questionIds.length } };
};

export const unassignQuestionsService = async (classStandard, questionIds) => {
  const assignment = await AssignedMathQuestion.findOne({ classStandard });
  if (!assignment) throw new Error(`No assignment found for class ${classStandard}`);
  const questionObjectIds = questionIds.map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);
  assignment.questionIds = assignment.questionIds.filter(assignedId => !questionObjectIds.some(removeId => removeId.equals(assignedId)));
  assignment.updatedAt = new Date();
  await assignment.save();
  return { classStandard, removedCount: questionIds.length, remainingCount: assignment.questionIds.length };
};

export const getAvailableQuestionsForAssignmentService = async (classStandard, filters = {}, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const assignment = await AssignedMathQuestion.findOne({ classStandard });
  const assignedQuestionIds = assignment ? assignment.questionIds : [];
  const query = { classStandard, isActive: { $ne: false }, _id: { $nin: assignedQuestionIds } };
  if (filters.subject) query.subject = filters.subject;
  if (filters.chapter) query.chapter = new RegExp(filters.chapter, 'i');
  if (filters.topic) query.topic = new RegExp(filters.topic, 'i');
  if (filters.questionType) query.questionType = filters.questionType;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.search) query.$or = [ { questionText: new RegExp(filters.search, 'i') }, { answer: new RegExp(filters.search, 'i') }, { chapter: new RegExp(filters.search, 'i') }, { topic: new RegExp(filters.search, 'i') } ];
  const totalQuestions = await MathQuestion.countDocuments(query);
  const totalPages = Math.ceil(totalQuestions / limit);
  const questions = await MathQuestion.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  return { questions, totalQuestions, totalPages, hasNext: page < totalPages, hasPrev: page > 1, assignmentInfo: { classStandard, totalAssigned: assignedQuestionIds.length, availableForAssignment: totalQuestions } };
};

export const assignNewQuestionsService = async (classStandard, questionIds) => {
  const questionObjectIds = questionIds.map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);
  const questions = await MathQuestion.find({ _id: { $in: questionObjectIds }, classStandard });
  if (questions.length !== questionIds.length) throw new Error('Some questions are invalid or do not belong to the specified class');
  let assignment = await AssignedMathQuestion.findOne({ classStandard });
  if (assignment) {
    const newQuestionIds = questionObjectIds.filter(id => !assignment.questionIds.some(existingId => existingId.equals(id)));
    if (newQuestionIds.length > 0) { assignment.questionIds.push(...newQuestionIds); assignment.updatedAt = new Date(); await assignment.save(); }
    return { classStandard, addedCount: newQuestionIds.length, totalAssigned: assignment.questionIds.length, skippedDuplicates: questionIds.length - newQuestionIds.length };
  } else {
    const newAssignment = new AssignedMathQuestion({ classStandard, questionIds: questionObjectIds, assignedAt: new Date() });
    await newAssignment.save();
    return { classStandard, addedCount: questionObjectIds.length, totalAssigned: questionObjectIds.length, skippedDuplicates: 0 };
  }
};
