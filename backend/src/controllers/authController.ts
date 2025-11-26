import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = signupSchema.parse(req.body);
  
  // Check if user already exists with complete profile
  const existingUser = await UserModel.findOne({ 
    email,
    password: { $ne: 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP' }
  });
  
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  // Check authorization based on role
  if (role === 'admin') {
    // For admin role, check if email is pre-authorized
    const adminUser = await UserModel.findOne({ 
      email,
      role: 'admin',
      password: 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP'
    });

    if (!adminUser) {
      return res.status(403).json({ 
        message: 'This email is not authorized for admin signup. Please contact the administrator.',
        contactAdmin: true,
        adminEmail: 'mayankkishor53@gmail.com'
      });
    }

    // Update the existing admin placeholder
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const updatedAdmin = await UserModel.findOneAndUpdate(
      { email },
      { 
        name,
        password: hashedPassword
      },
      { new: true }
    );

    // Generate token
    const token = jwt.sign(
      { _id: updatedAdmin!._id, email: updatedAdmin!.email, role: updatedAdmin!.role, name: updatedAdmin!.name },
      env.jwtSecret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Admin account activated successfully',
      token,
      user: {
        _id: updatedAdmin!._id,
        email: updatedAdmin!.email,
        role: updatedAdmin!.role,
        name: updatedAdmin!.name,
      },
    });
  } else if (role === 'employee') {
    // For employee role, check if email exists in employees collection
    // First, check if there's a placeholder account with this email
    const employeeCheck = await UserModel.findOne({ 
      email,
      password: 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP'
    });

    console.log(`Checking employee signup for email: ${email}`, {
      found: !!employeeCheck,
      role: employeeCheck?.role
    });

    if (!employeeCheck) {
      return res.status(403).json({ 
        message: 'This email is not registered as an employee. Please contact the administrator.',
        contactAdmin: true,
        adminEmail: 'mayankkishor53@gmail.com'
      });
    }
    
    // If the placeholder account exists but with a different role, inform the user
    if (employeeCheck.role !== 'employee') {
      return res.status(403).json({
        message: `This email is registered as a ${employeeCheck.role}, not an employee. Please select the correct role or contact the administrator.`,
        contactAdmin: true,
        adminEmail: 'mayankkishor53@gmail.com'
      });
    }

    // Update the existing employee placeholder
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const updatedEmployee = await UserModel.findOneAndUpdate(
      { email },
      { 
        name,
        password: hashedPassword
      },
      { new: true }
    );

    // Generate token
    const token = jwt.sign(
      { _id: updatedEmployee!._id, email: updatedEmployee!.email, role: updatedEmployee!.role, name: updatedEmployee!.name },
      env.jwtSecret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Employee account activated successfully',
      token,
      user: {
        _id: updatedEmployee!._id,
        email: updatedEmployee!.email,
        role: updatedEmployee!.role,
        name: updatedEmployee!.name,
      },
    });
  } else {
    // For any other role, reject
    return res.status(400).json({ 
      message: 'Invalid role specified',
      contactAdmin: true,
      adminEmail: 'mayankkishor53@gmail.com'
    });
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Account not found. Please sign up first.' });
  }

  // Check if this is a placeholder account that hasn't been activated yet
  if (user.password === 'PLACEHOLDER_PASSWORD_WILL_BE_SET_ON_SIGNUP') {
    return res.status(403).json({ 
      message: 'Account not activated. Please sign up first.',
      needsSignup: true
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Wrong password. Please try again.' });
  }

  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

