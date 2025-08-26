import express from 'express';
import scienceController  from '../controllers/scienceController.js';
const router = express.Router();

router.get('/practice', scienceController.getPracticeWords);
router.post('/submitratings', scienceController.submitRatings);

// Question generation routes
router.post('/generateQuestions', scienceController.generateQuestions);
router.post('/save-selected', scienceController.saveSelectedQuestions);

// Question retrieval routes
router.get('/get-science-questions/:classStandard', scienceController.getAssignedScienceQuestions);
router.get('/get-all-questions', scienceController.getAllQuestions);
router.get('/filter-questions', scienceController.getQuestionsByFilters);
router.get('/science-question/stats', scienceController.getQuestionStats);

// Question management routes
router.put('/update-question/:id', scienceController.updateQuestion);
router.delete('/delete-question/:id', scienceController.deleteQuestion);

// Question assignment routes
router.post('/assign-science-questions', scienceController.assignQuestionsToClass);

// Question management routes for assigned questions
router.get('/assigned-questions/:classStandard', scienceController.getAssignedQuestions);
router.delete('/unassign-questions/:classStandard', scienceController.unassignQuestions);

// Question assignment routes
router.get('/available-questions/:classStandard', scienceController.getAvailableQuestionsForAssignment);
router.post('/assign-questions/:classStandard', scienceController.assignNewQuestions);

router.post('/bulk-upload', scienceController.bulkUploadQuestions);


export default router;
