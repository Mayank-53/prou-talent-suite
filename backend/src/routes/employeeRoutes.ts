import { Router } from 'express';
import { createEmployee, deleteEmployee, getEmployee, getEmployees, updateEmployee } from '../controllers/employeeController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', requireAuth(['admin', 'manager']), createEmployee);
router.put('/:id', requireAuth(['admin', 'manager']), updateEmployee);
router.delete('/:id', requireAuth(['admin']), deleteEmployee);

export default router;

