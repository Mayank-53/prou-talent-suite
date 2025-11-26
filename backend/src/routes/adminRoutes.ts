import { Router } from 'express';
import { addAdminEmail, checkEmail, getAdminEmails, removeAdminEmail } from '../controllers/adminController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public route to check if email is authorized for admin signup
router.get('/check-email', checkEmail);

// Admin-only routes
router.get('/', requireAuth(['admin']), getAdminEmails);
router.post('/', requireAuth(['admin']), addAdminEmail);
router.delete('/:id', requireAuth(['admin']), removeAdminEmail);

export default router;
