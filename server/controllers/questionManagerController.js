import { assignQuestions, deassignQuestions, listAssigned, listSubjects, listClasses, listChapters } from '../services/questionManagerService.js';

const questionManagerController = {
  assign: async (req, res) => {
    try {
        const { subject, classStandard, chapter, questionIds, assignedBy } = req.body;
        if (!subject || !Array.isArray(questionIds) || questionIds.length === 0) {
          return res.status(400).json({ error: 'subject and non-empty questionIds array are required' });
        }
        try {
          const result = await assignQuestions({ subject, classStandard, chapter, questionIds, assignedBy });
          return res.status(200).json({ success: true, result });
        } catch (err) {
          console.error('assign error', err);
          return res.status(500).json({ error: err.message });
        }
    } catch (err) {
      console.error('Assign error', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deassign: async (req, res) => {
    try {
        const { subject, classStandard, chapter, questionIds } = req.body;
        if (!subject || !Array.isArray(questionIds) || questionIds.length === 0) {
          return res.status(400).json({ error: 'subject and non-empty questionIds array are required' });
        }
        try {
          const result = await deassignQuestions({ subject, classStandard, chapter, questionIds });
          return res.status(200).json({ success: true, result });
        } catch (err) {
          console.error('deassign error', err);
          return res.status(500).json({ error: err.message });
        }
    } catch (err) {
      console.error('Deassign error', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  list: async (req, res) => {
    try {
        const { subject, classStandard, chapter, page = 1, limit = 20 } = req.query;
        if (!subject || !classStandard) {
          return res.status(400).json({ success: false, message: 'subject and classStandard required' });
        }
        try {
          const data = await listAssigned({ subject, classStandard, chapter, page: Number(page), limit: Number(limit) });
          return res.status(200).json({ success: true, data });
        } catch (err) {
          console.error('listAssigned error', err);
          return res.status(500).json({ error: err.message });
        }
    } catch (err) {
      console.error('List assigned error', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default questionManagerController;

// Generate unified questions endpoint
questionManagerController.generate = async (req, res) => {
  try {
    const params = req.body;
    // basic validation
    const { subject, classStandard, chapter, numberOfQuestions, questionType } = params;
    if (!subject || !classStandard || !chapter || !numberOfQuestions || !questionType) {
      return res.status(400).json({ success: false, message: 'subject, classStandard, chapter, numberOfQuestions and questionType are required' });
    }

    const { generateUnifiedQuestions } = await import('../services/questionGeneratorService.js');

    try {
      const result = await generateUnifiedQuestions(params);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error('generate error', err);
      return res.status(500).json({ success: false, message: err.message || 'Generation failed' });
    }

  } catch (err) {
    console.error('Generate handler error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

questionManagerController.bulkUpload = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions array required' });
    }

    const { bulkUploadQuestions } = await import('../services/questionManagerService.js');
    try {
      const result = await bulkUploadQuestions(questions);
      return res.status(200).json({ success: true, result });
    } catch (err) {
      console.error('bulk upload error', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  } catch (err) {
    console.error('bulkUpload handler error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Additional handlers
export const subjects = async (req, res) => {
  try {
    const data = await listSubjects();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('subjects error', err);
    return res.status(500).json({ error: err.message });
  }
};

export const classes = async (req, res) => {
  try {
    const data = await listClasses();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('classes error', err);
    return res.status(500).json({ error: err.message });
  }
};

export const chapters = async (req, res) => {
  try {
    const { subject, classStandard } = req.query;
    const data = await listChapters({ subject, classStandard });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('chapters error', err);
    return res.status(500).json({ error: err.message });
  }
};
