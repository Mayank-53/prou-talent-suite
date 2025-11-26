import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';

// Schema for adding new admin emails
const adminEmailSchema = z.object({
  email: z.string().email(),
});

// Check if an email is authorized for admin signup
export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if this email is registered as an admin email
  const adminUser = await UserModel.findOne({ 
    email: email.toLowerCase(),
    role: 'admin'
  });

  if (adminUser) {
    return res.status(200).json({ isAuthorized: true });
  }

  return res.status(200).json({ isAuthorized: false });
});

// Get all admin emails (admin only)
export const getAdminEmails = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const adminUsers = await UserModel.find({ role: 'admin' }, 'email name');
  res.json(adminUsers);
});

// Add a new admin email (admin only)
export const addAdminEmail = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { email } = adminEmailSchema.parse(req.body);
  
  // Check if email already exists
  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Create a placeholder user with admin role
  // This user will be updated when they sign up
  const adminUser = await UserModel.create({
    email: email.toLowerCase(),
    name: `Admin (${email})`,
    role: 'admin',
    password: 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP',
  });

  res.status(201).json({ 
    message: 'Admin email added successfully',
    email: adminUser.email
  });
});

// Remove admin access (admin only)
export const removeAdminEmail = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { id } = req.params;
  
  // Don't allow removing the default admin
  const adminToRemove = await UserModel.findById(id);
  if (!adminToRemove) {
    return res.status(404).json({ message: 'Admin not found' });
  }
  
  // Check if this is the default admin
  if (adminToRemove.email === 'mayankkishor53@gmail.com') {
    return res.status(403).json({ message: 'Cannot remove the default admin account' });
  }

  await UserModel.findByIdAndDelete(id);
  res.json({ message: 'Admin removed successfully' });
});
