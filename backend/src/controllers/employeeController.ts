import { Request, Response } from 'express';
import { z } from 'zod';
import { EmployeeModel } from '../models/Employee';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../middleware/authMiddleware';

const employeeBody = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  department: z.string().min(1, 'Department is required'),
  avatarUrl: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'on-leave', 'inactive']).default('active'),
  skills: z.array(z.string()).default([]),
  bio: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  salary: z.number().optional(),
  startDate: z.string().optional().or(z.literal('')),
  joinedAt: z.string().optional().or(z.literal('')),
});

export const getEmployees = asyncHandler(async (_req: Request, res: Response) => {
  try {
    console.log('Fetching employees from database...');
    const employees = await EmployeeModel.find().sort({ createdAt: -1 });
    console.log(`Found ${employees.length} employees`);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employees',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const getEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await EmployeeModel.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  res.json(employee);
});

export const createEmployee = asyncHandler(async (req: AuthedRequest, res: Response) => {
  try {
    console.log('Creating employee with data:', req.body);
    
    const payload = employeeBody.parse(req.body);
    
    // Create the employee first
    const employee = await EmployeeModel.create(payload);
    console.log('Employee created successfully:', employee._id);
    
    // Also create a placeholder user account for this employee
    const { UserModel } = await import('../models/User.js');
    const bcrypt = await import('bcryptjs');
    
    // Check if a user with this email already exists
    const existingUser = await UserModel.findOne({ email: payload.email });
    
    if (!existingUser) {
      // Create a hashed placeholder password
      const hashedPassword = await bcrypt.hash('PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP', 12);
      
      // Create a placeholder user account that will be updated when the employee signs up
      const placeholderUser = await UserModel.create({
        name: payload.name,
        email: payload.email,
        role: payload.role || 'employee',
        password: hashedPassword,
        department: payload.department,
        location: payload.location,
        bio: payload.bio,
        phone: payload.phone,
        skills: payload.skills,
        status: payload.status,
        avatarUrl: payload.avatarUrl,
      });
      
      console.log(`Created placeholder user account for employee: ${payload.email}`, {
        userId: placeholderUser._id,
        email: placeholderUser.email,
        role: placeholderUser.role
      });
    } else {
      console.log(`User already exists for employee email: ${payload.email}`, {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
      });
    }
    
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: (error as any).errors
        });
      }
      
      // Handle MongoDB duplicate key errors
      if ((error as any).code === 11000) {
        return res.status(409).json({
          message: 'Employee with this email already exists'
        });
      }
    }
    
    res.status(500).json({
      message: 'Failed to create employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const updateEmployee = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const payload = employeeBody.partial().parse(req.body);
  const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  res.json(employee);
});

export const deleteEmployee = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const deleted = await EmployeeModel.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  res.json({ message: 'Employee deleted' });
});

