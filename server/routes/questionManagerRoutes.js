import express from 'express';
import questionManagerController, { subjects, classes, chapters } from '../controllers/questionManagerController.js';

const router = express.Router();

router.post('/assign', questionManagerController.assign);
router.post('/deassign', questionManagerController.deassign);
router.post('/generate', questionManagerController.generate);
router.post('/bulk-upload', questionManagerController.bulkUpload);
router.get('/assigned', questionManagerController.list);
router.get('/subjects', subjects);
router.get('/classes', classes);
router.get('/chapters', chapters);
// simple debug endpoint to verify route is reachable
router.get('/debug', (req, res) => res.status(200).json({ ok: true, route: 'question-manager' }));

export default router;
