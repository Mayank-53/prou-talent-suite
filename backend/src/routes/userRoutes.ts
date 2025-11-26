import { Router } from 'express';
import { updateAvatar, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Update user profile
router.put(
  '/profile',
  requireAuth(),
  updateProfile
);

// Update user avatar
router.put(
  '/avatar',
  requireAuth(),
  upload.single('avatar'),
  updateAvatar
);

export default router;
