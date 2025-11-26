import { Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { EmployeeModel } from '../models/Employee';
import fs from 'fs';
import { uploadImage } from '../config/cloudinary';
import { env } from '../config/env';

// Schema for updating user profile
const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

/**
 * Update the current user's profile
 */
export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userData = profileUpdateSchema.parse(req.body);
  
  // Update the user
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    userData,
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  // If the user is also an employee, update the employee record
  if (req.user.role === 'employee' || req.user.role === 'manager') {
    const employee = await EmployeeModel.findOne({ email: req.user.email });
    if (employee) {
      await EmployeeModel.updateOne(
        { email: req.user.email },
        userData
      );
    }
  }

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * Update the current user's avatar
 */
export const updateAvatar = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  let avatarUrl = '';

  try {
    // Upload to Cloudinary if configured
    if (env.isCloudinaryConfigured) {
      const result = await uploadImage(filePath, 'avatars');
      avatarUrl = result.secure_url;
      
      // Delete local file after upload
      fs.unlinkSync(filePath);
    } else {
      // Use local path for development
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    // Update user avatar
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is also an employee, update the employee avatar
    if (req.user.role === 'employee' || req.user.role === 'manager') {
      const employee = await EmployeeModel.findOne({ email: req.user.email });
      if (employee) {
        await EmployeeModel.updateOne(
          { email: req.user.email },
          { avatarUrl }
        );
      }
    }

    res.json({
      message: 'Avatar updated successfully',
      avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    // Clean up the file if upload failed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.error('Avatar upload error:', error);
    return res.status(500).json({ message: 'Failed to update avatar' });
  }
});
