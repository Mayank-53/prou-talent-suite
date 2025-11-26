import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { deleteFile, uploadFile } from '../controllers/uploadController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Upload a single file (image)
router.post(
  '/image',
  requireAuth(), // Require authentication for uploads
  upload.single('image'), // 'image' is the field name in the form
  uploadFile
);

// Delete a file from Cloudinary
router.delete(
  '/:publicId',
  requireAuth(['admin']), // Only admins can delete files
  deleteFile
);

export default router;
