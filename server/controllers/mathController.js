import {
  generateQuestionsService,
  saveQuestionsService,
  bulkUploadQuestionsService,
  getMathQuizQuestionsService,
  getQuestionsByFiltersService,
  updateQuestionService,
  deleteQuestionService,
  assignQuestionsToClassService,
  fetchAssignedMathQuestions,
  getAssignedQuestionsService,
  unassignQuestionsService,
  getAvailableQuestionsForAssignmentService,
  assignNewQuestionsService
} from '../services/math/mathService.js';

const mathController = {
  generateQuestions: async (req, res) => {
    try {
      const { classStandard, subject, chapter, topic, questionType, numberOfQuestions } = req.body;
      if (!classStandard || !subject || !chapter || !topic) return res.status(400).json({ success: false, message: 'Missing required fields' });
      const result = await generateQuestionsService({ classStandard, subject, chapter, topic, questionType, numberOfQuestions });
      res.status(200).json({ success: true, questions: result.questions, metadata: { generatedAt: new Date(), parameters: { classStandard, subject, chapter, topic, questionType, numberOfQuestions } } });
    } catch (error) {
      console.error('Math generate error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  saveSelectedQuestions: async (req, res) => {
    try {
      const questions = req.body;
      if (!Array.isArray(questions) || questions.length === 0) return res.status(400).json({ success: false, message: 'Questions array is required' });
      const result = await saveQuestionsService(questions);
      res.status(201).json({ success: true, message: `Saved ${result.savedCount} questions`, savedQuestions: result.savedQuestions });
    } catch (error) {
      console.error('Math saveSelected error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  bulkUploadQuestions: async (req, res) => {
    try {
      const { questions } = req.body;
      if (!questions || !Array.isArray(questions) || questions.length === 0) return res.status(400).json({ success: false, message: 'Questions array required' });
      const result = await bulkUploadQuestionsService(questions);
      res.status(200).json({ success: true, count: result.count, questions: result.questions, assignments: result.assignments, message: `Uploaded ${result.count} questions and assigned to ${result.assignmentCount} classes` });
    } catch (error) {
      console.error('Math bulk upload error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllQuestions: async (req, res) => {
    try {
      const uid = req.query.uid;
      const questions = await getMathQuizQuestionsService(uid);
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getQuestionsByFilters: async (req, res) => {
    try {
      const filters = { classStandard: req.query.classStandard, subject: req.query.subject, chapter: req.query.chapter, topic: req.query.topic, questionType: req.query.questionType, search: req.query.search };
      Object.keys(filters).forEach(k => { if (filters[k] === undefined || filters[k] === '') delete filters[k]; });
      const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
      const result = await getQuestionsByFiltersService(filters, { page, limit });
      res.status(200).json({ success: true, questions: result.questions, pagination: { currentPage: page, totalPages: result.totalPages, totalQuestions: result.totalQuestions } });
    } catch (error) {
      console.error('Math filter error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAssignedMathQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params;
      const questions = await fetchAssignedMathQuestions(classStandard);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  assignQuestionsToClass: async (req, res) => {
    try {
      const { classStandard, questionIds } = req.body;
      if (!classStandard || !Array.isArray(questionIds) || questionIds.length === 0) return res.status(400).json({ message: 'Class and questions required' });
      await assignQuestionsToClassService(classStandard, questionIds);
      res.status(200).json({ message: `Questions assigned to ${classStandard}` });
    } catch (error) {
      console.error('Math assign error', error);
      res.status(500).json({ message: 'Failed to assign questions' });
    }
  },

  getAssignedQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params;
      const filters = { subject: req.query.subject, chapter: req.query.chapter, topic: req.query.topic, questionType: req.query.questionType, difficulty: req.query.difficulty, search: req.query.search };
      Object.keys(filters).forEach(k => { if (filters[k] === undefined || filters[k] === '') delete filters[k]; });
      const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
      const result = await getAssignedQuestionsService(classStandard, filters, { page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Math getAssignedQuestions error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  unassignQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params; const { questionIds } = req.body;
      if (!classStandard) return res.status(400).json({ success: false, message: 'Class standard required' });
      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) return res.status(400).json({ success: false, message: 'Question IDs array required' });
      const result = await unassignQuestionsService(classStandard, questionIds);
      res.status(200).json({ success: true, message: `Unassigned ${result.removedCount} questions`, data: result });
    } catch (error) {
      console.error('Math unassign error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAvailableQuestionsForAssignment: async (req, res) => {
    try {
      const { classStandard } = req.params;
      const filters = { subject: req.query.subject, chapter: req.query.chapter, topic: req.query.topic, questionType: req.query.questionType, difficulty: req.query.difficulty, search: req.query.search };
      Object.keys(filters).forEach(k => { if (filters[k] === undefined || filters[k] === '') delete filters[k]; });
      const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
      const result = await getAvailableQuestionsForAssignmentService(classStandard, filters, { page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Math available questions error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  assignNewQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params; const { questionIds } = req.body;
      if (!classStandard) return res.status(400).json({ success: false, message: 'Class standard required' });
      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) return res.status(400).json({ success: false, message: 'Question IDs array required' });
      const result = await assignNewQuestionsService(classStandard, questionIds);
      res.status(200).json({ success: true, message: `Assigned ${result.addedCount} questions to ${classStandard}`, data: result });
    } catch (error) {
      console.error('Math assignNewQuestions error', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default mathController;
