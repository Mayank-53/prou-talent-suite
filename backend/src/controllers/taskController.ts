import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { TaskModel } from '../models/Task';
import { EmployeeModel } from '../models/Employee';
import { AuthedRequest } from '../middleware/authMiddleware';

const taskBody = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  assignedTo: z.string(),
  dueDate: z.string(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).default([]),
  progress: z.number().min(0).max(100).default(0),
});

export const getTasks = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { status, assignedTo, priority, search } = req.query;
  const query: Record<string, unknown> = {};
  
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority && priority !== 'all') query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  // If the user is an employee, only return tasks assigned to them
  // We'll check both by user ID and by email to ensure we catch all assignments
  if (req.user && req.user.role === 'employee') {
    console.log(`Filtering tasks for employee: ${req.user.email} (${req.user._id})`);
    
    // Find employee record to get both ID and email
    const employee = await EmployeeModel.findOne({ email: req.user.email });
    
    if (employee) {
      // Use $or to match either by ID or by email reference
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: employee._id }
      ];
      console.log(`Found employee record with ID: ${employee._id}`);
    } else {
      // Fallback to user ID if employee record not found
      query.assignedTo = req.user._id;
      console.log(`No employee record found, using user ID: ${req.user._id}`);
    }
  }

  const tasks = await TaskModel.find(query)
    .populate('assignedTo', 'name email avatarUrl department role status')
    .populate('createdBy', 'name email avatarUrl')
    .sort({ dueDate: 1 });
  
  console.log(`Found ${tasks.length} tasks matching query:`, JSON.stringify(query));
  res.json(tasks);
});

export const createTask = asyncHandler(async (req: AuthedRequest, res: Response) => {
  try {
    const payload = taskBody.parse(req.body);
    
    // Create a task object with the validated payload
    const taskData: any = { ...payload };
    
    // Add createdBy if it's an authenticated request
    if ('user' in req && req.user?._id) {
      taskData.createdBy = req.user._id;
    }
    
    // Ensure description is at least 5 characters
    if (taskData.description.length < 5) {
      return res.status(400).json({
        message: 'Task description must be at least 5 characters long',
        field: 'description'
      });
    }
    
    // Create the task
    const task = await TaskModel.create(taskData);
    
    // Log task creation (cast to any to avoid TypeScript errors)
    const taskObj = task as any;
    console.log('Task created:', {
      _id: taskObj._id,
      title: taskObj.title,
      assignedTo: taskObj.assignedTo,
      status: taskObj.status
    });
    
    // Return the newly created task with populated fields
    const populatedTask = await TaskModel.findById((task as any)._id)
      .populate('assignedTo')
      .populate('createdBy', 'name email');
      
    res.status(201).json(populatedTask);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors[0];
      return res.status(400).json({
        message: firstError.message,
        field: firstError.path.join('.'),
        zodErrors: (error as any).errors
      });
    }
    throw error; // Let the global error handler deal with other types of errors
  }
});

export const updateTask = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const payload = taskBody.partial().parse(req.body);
  
  // Find the task first to check if it exists
  const existingTask = await TaskModel.findById(req.params.id);
  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // Update the task
  const updatedTask = await TaskModel.findByIdAndUpdate(
    req.params.id, 
    payload, 
    { new: true }
  )
  .populate('assignedTo')
  .populate('createdBy', 'name email');
  
  console.log('Task updated:', {
    _id: updatedTask?._id,
    title: updatedTask?.title,
    status: updatedTask?.status,
    assignedTo: updatedTask?.assignedTo
  });
  
  res.json(updatedTask);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskModel.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json({ message: 'Task deleted' });
});

