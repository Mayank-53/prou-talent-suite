import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth(), getTasks);
router.post('/', requireAuth(['admin', 'manager']), createTask);
router.put('/:id', requireAuth(['admin', 'manager']), updateTask);
router.delete('/:id', requireAuth(['admin']), deleteTask);

export default router;

