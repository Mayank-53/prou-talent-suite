import { Router } from 'express';
import { submitTaskCompletion } from '../controllers/submissionController';
import { requireAuth } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Submit a task completion with files
router.post(
  '/:taskId/submit',
  requireAuth(), // Any authenticated user
  upload.array('files', 5), // Allow up to 5 files
  submitTaskCompletion
);

export default router;
