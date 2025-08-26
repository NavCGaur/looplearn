import { fetchUserWordsDue, 
  updateMultipleUserWordRatings, 
  generateQuestionsService, 
  getQuestionStatsService, 
  deleteQuestionService, 
  updateQuestionService,
  getScienceQuizQuestionsService,
 getQuestionsByFiltersService,
  saveQuestionsService,
  assignQuestionsToClassService,
  fetchAssignedScienceQuestions,
  bulkUploadQuestionsService,
  getAssignedQuestionsService,
  unassignQuestionsService,
  getAvailableQuestionsForAssignmentService,
  assignNewQuestionsService
 } from '../services/science/scienceService.js';


const scienceController= {

    getPracticeWords : async (req, res) => {

        const {userId} = req.query; 
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        try {
          const words = await fetchUserWordsDue(userId);
          res.json(words);
        } catch (err) {
          res.status(500).json({ message: 'Error fetching words' });
        }
      },

      submitRatings: async (req, res) => {
        const { userId, ratings } = req.body;
    
 
        if (!userId || !Array.isArray(ratings)) {
          return res.status(400).json({ message: 'Invalid payload' });
        }
    
        try {
          await updateMultipleUserWordRatings(userId, ratings);
          res.status(200).json({ message: 'Ratings updated successfully' });
        } catch (error) {
          console.error('Error submitting ratings:', error);
          res.status(500).json({ message: 'Server error updating ratings' });
        }
      },



  generateQuestions: async (req, res) => {
    try {
      console.log('Generate questions request:', req.body);

      const { classStandard, subject, chapter, topic, questionType, numberOfQuestions } = req.body;

      if (!classStandard || !subject || !chapter || !topic) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: classStandard, subject, chapter, topic'
        });
      }

      if (numberOfQuestions > 15 || numberOfQuestions < 1) {
        return res.status(400).json({
          success: false,
          message: 'Number of questions must be between 1 and 15'
        });
      }

      const result = await generateQuestionsService({
        classStandard,
        subject,
        chapter,
        topic,
        questionType: questionType || 'fill-in-blank',
        numberOfQuestions: numberOfQuestions || 5
      });

      res.status(200).json({
        success: true,
        message: `Successfully generated ${result.questions.length} questions`,
        questions: result.questions,
        metadata: {
          generatedAt: new Date().toISOString(),
          parameters: {
            classStandard,
            subject,
            chapter,
            topic,
            questionType,
            numberOfQuestions
          }
        }
      });

    } catch (error) {
      console.error('Error in generateQuestions controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate questions',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  saveSelectedQuestions: async (req, res) => {
    try {
      console.log('Save selected questions request:', req.body);

      const questions = req.body;

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Questions array is required and cannot be empty'
        });
      }

      for (const question of questions) {
        if (!question.questionText || !question.answer) {
          return res.status(400).json({
            success: false,
            message: 'Each question must have questionText and answer'
          });
        }
      }

      const result = await saveQuestionsService(questions);

      res.status(201).json({
        success: true,
        message: `Successfully saved ${result.savedCount} questions to database`,
        savedQuestions: result.savedQuestions,
        duplicates: result.duplicates || 0
      });

    } catch (error) {
      console.error('Error in saveSelectedQuestions controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save questions',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },


  getAssignedScienceQuestions: async (req, res) => {
   try {
    const { classStandard } = req.params;
    console.log('Fetching assigned questions for class:', classStandard);
    const questions = await fetchAssignedScienceQuestions(classStandard);
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch assigned questions.' });
  }
  } ,

  getAllQuestions: async (req, res) => {
    try {

        console.log("Query object:", req.query);

      console.log('Get all questions request');
  const uid = req.query.uid;
      console.log('Fetching questions for user ID:', uid);
    const questions = await getScienceQuizQuestionsService(uid);
    
    res.status(200).json({
      success: true,
      data: questions,
      message: 'Science quiz questions fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
  },

  getQuestionsByFilters: async (req, res) => {
    try {
      const filters = {
        classStandard: req.query.classStandard,
        subject: req.query.subject,
        chapter: req.query.chapter,
        topic: req.query.topic,
        questionType: req.query.questionType,
        search: req.query.search
      };

      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await getQuestionsByFiltersService(filters, { page, limit });

      res.status(200).json({
        success: true,
        questions: result.questions,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          totalQuestions: result.totalQuestions,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        },
        appliedFilters: filters
      });

    } catch (error) {
      console.error('Error in getQuestionsByFilters controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve filtered questions'
      });
    }
  },

  updateQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Question ID is required'
        });
      }

      const updatedQuestion = await updateQuestionService(id, updateData);

      if (!updatedQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        question: updatedQuestion
      });

    } catch (error) {
      console.error('Error in updateQuestion controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update question'
      });
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Question ID is required'
        });
      }

      const deletedQuestion = await deleteQuestionService(id);

      if (!deletedQuestion) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteQuestion controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete question'
      });
    }
  },

  getQuestionStats: async (req, res) => {
    try {
      const stats = await getQuestionStatsService();

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error in getQuestionStats controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve question statistics'
      });
    }
  },


  assignQuestionsToClass: async (req, res) => {
    try {
    const { classStandard, questionIds } = req.body;

    if (!classStandard || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'Class and questions are required.' });
    }

    await assignQuestionsToClassService(classStandard, questionIds);

    res.status(200).json({ message: `Questions assigned to ${classStandard} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to assign questions.' });
  }
  }       
,
  bulkUploadQuestions: async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required and cannot be empty'
      });
    }

    const result = await bulkUploadQuestionsService(questions);
    
    res.status(200).json({
      success: true,
      count: result.count,
      questions: result.questions,
      assignments: result.assignments,
      message: `Successfully uploaded ${result.count} questions and assigned them to ${result.assignmentCount} class(es)`
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload questions'
    });
  }
  },

  getAssignedQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params;
      
      const filters = {
        subject: req.query.subject,
        chapter: req.query.chapter,
        topic: req.query.topic,
        questionType: req.query.questionType,
        difficulty: req.query.difficulty,
        search: req.query.search
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await getAssignedQuestionsService(classStandard, filters, { page, limit });

      res.status(200).json({
        success: true,
        data: result,
        appliedFilters: filters
      });

    } catch (error) {
      console.error('Error in getAssignedQuestions controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve assigned questions'
      });
    }
  },

  unassignQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params;
      const { questionIds } = req.body;

      if (!classStandard) {
        return res.status(400).json({
          success: false,
          message: 'Class standard is required'
        });
      }

      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Question IDs array is required and cannot be empty'
        });
      }

      const result = await unassignQuestionsService(classStandard, questionIds);

      res.status(200).json({
        success: true,
        message: `Successfully unassigned ${result.removedCount} questions from ${classStandard}`,
        data: result
      });

    } catch (error) {
      console.error('Error in unassignQuestions controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unassign questions'
      });
    }
  },

  getAvailableQuestionsForAssignment: async (req, res) => {
    try {
      const { classStandard } = req.params;
      
      const filters = {
        subject: req.query.subject,
        chapter: req.query.chapter,
        topic: req.query.topic,
        questionType: req.query.questionType,
        difficulty: req.query.difficulty,
        search: req.query.search
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await getAvailableQuestionsForAssignmentService(classStandard, filters, { page, limit });

      res.status(200).json({
        success: true,
        data: result,
        appliedFilters: filters
      });

    } catch (error) {
      console.error('Error in getAvailableQuestionsForAssignment controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve available questions'
      });
    }
  },

  assignNewQuestions: async (req, res) => {
    try {
      const { classStandard } = req.params;
      const { questionIds } = req.body;

      if (!classStandard) {
        return res.status(400).json({
          success: false,
          message: 'Class standard is required'
        });
      }

      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Question IDs array is required and cannot be empty'
        });
      }

      const result = await assignNewQuestionsService(classStandard, questionIds);

      res.status(200).json({
        success: true,
        message: `Successfully assigned ${result.addedCount} questions to ${classStandard}${result.skippedDuplicates > 0 ? ` (${result.skippedDuplicates} duplicates skipped)` : ''}`,
        data: result
      });

    } catch (error) {
      console.error('Error in assignNewQuestions controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign questions'
      });
    }
  },



}

export default scienceController