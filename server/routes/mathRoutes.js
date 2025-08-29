import express from 'express';
import mathController from '../controllers/mathController.js';
import validateBulkUpload from '../middleware/validateBulkUpload.js';
const router = express.Router();

router.post('/generateQuestions', mathController.generateQuestions);
router.post('/save-selected', mathController.saveSelectedQuestions);
router.post('/bulk-upload', validateBulkUpload, mathController.bulkUploadQuestions);

router.get('/get-math-questions/:classStandard', mathController.getAssignedMathQuestions);
router.get('/get-all-questions', mathController.getAllQuestions);
router.get('/filter-questions', mathController.getQuestionsByFilters);

router.post('/assign-math-questions', mathController.assignQuestionsToClass);
router.get('/assigned-questions/:classStandard', mathController.getAssignedQuestions);
router.delete('/unassign-questions/:classStandard', mathController.unassignQuestions);
router.get('/available-questions/:classStandard', mathController.getAvailableQuestionsForAssignment);
router.post('/assign-questions/:classStandard', mathController.assignNewQuestions);

export default router;
