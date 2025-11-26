import { Request, Response } from 'express';
import fs from 'fs';
import { Types } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImage } from '../config/cloudinary';
import { TaskModel } from '../models/Task';
import { EmployeeModel } from '../models/Employee';
import { UserModel } from '../models/User';
import { AuthedRequest } from '../middleware/authMiddleware';
import { env } from '../config/env';

/**
 * Submit a task completion with files and comments
 */
export const submitTaskCompletion = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { taskId } = req.params;
  const { comment, remarks, skipFileUpload } = req.body;
  const files = req.files as Express.Multer.File[];
  
  console.log(`Task submission for task ${taskId} - skipFileUpload: ${skipFileUpload}`);
  console.log(`Files received: ${files?.length || 0}`);
  console.log(`Comment length: ${comment?.length || 0}, Remarks length: ${remarks?.length || 0}`);
  
  // Check if task exists
  const task = await TaskModel.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // Check if the user is assigned to this task
  // This is a critical check that needs to handle different ways tasks can be assigned
  try {
    console.log(`Task submission attempt - Task ID: ${taskId}`);
    console.log(`Task assignedTo: ${task.assignedTo}, type: ${typeof task.assignedTo}`);
    console.log(`User ID: ${req.user?._id}`);
    
    // First, try direct string comparison
    const directMatch = task.assignedTo.toString() === req.user?._id?.toString();
    
    if (directMatch) {
      console.log('Direct match found between task.assignedTo and user._id');
    } else {
      console.log('No direct match, checking employee record...');
      
      // Find the employee record for this user to check if it matches the task assignment
      const employee = await EmployeeModel.findOne({ email: req.user?.email });
      
      if (employee && employee._id.toString() === task.assignedTo.toString()) {
        console.log(`Employee record found with matching ID: ${employee._id}`);
        // Allow submission as the employee ID matches
      } else if (!directMatch) {
        // Neither user ID nor employee ID matches
        console.log('User is not assigned to this task - Access denied');
        return res.status(403).json({ 
          message: 'You are not assigned to this task',
          details: {
            taskAssignedTo: task.assignedTo.toString(),
            userId: req.user?._id?.toString(),
            employeeId: employee?._id?.toString()
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking task assignment:', error);
    return res.status(500).json({ message: 'Error verifying task assignment' });
  }

  // Upload files to Cloudinary if configured and skipFileUpload is not true
  const fileUrls: { url: string; publicId?: string; originalName: string; fileType: string }[] = [];
  
  if (skipFileUpload === 'true') {
    console.log('Skipping file upload as requested by client');
  } else if (files && files.length > 0) {
    console.log(`Processing ${files.length} files for upload`);
    
    // Track successful and failed uploads
    let successCount = 0;
    let failCount = 0;
    
    for (const file of files) {
      try {
        // Check file size - log warning but still try to upload
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.originalname} is larger than 10MB (${Math.round(file.size / (1024 * 1024))}MB)`);
        }
        
        if (env.isCloudinaryConfigured) {
          // Upload to Cloudinary
          const result = await uploadImage(file.path, 'task-submissions');
          
          // Get file type from the original file
          const fileType = file.originalname.split('.').pop() || '';
          
          fileUrls.push({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
            fileType
          });
          
          // Delete the local file after upload
          fs.unlinkSync(file.path);
          successCount++;
        } else {
          // Store locally for development
          const localUrl = `/uploads/${file.filename}`;
          const fileType = file.originalname.split('.').pop() || '';
          
          fileUrls.push({
            url: localUrl,
            originalName: file.originalname,
            fileType
          });
          successCount++;
        }
      } catch (error) {
        console.error(`File upload error for ${file.originalname}:`, error);
        failCount++;
        
        // Clean up the file if upload failed
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    console.log(`File uploads completed: ${successCount} successful, ${failCount} failed`);
  }

  // Update the task with submission details
  task.status = 'done';
  task.progress = 100;
  // Create the submission object with proper type handling
  if (req.user && req.user._id) {
    task.submission = {
      comment,
      remarks: remarks || '',
      files: fileUrls,
      submittedAt: new Date(),
      submittedBy: new Types.ObjectId(req.user._id)
    };
  } else {
    // This should never happen due to auth middleware, but handle it anyway
    console.error('No user ID found for submission');
    return res.status(500).json({ message: 'Internal server error: User ID not found' });
  }

  await task.save();

  // Prepare a detailed response message
  let responseMessage = 'Task completed successfully';
  
  // Add file upload details if applicable
  if (skipFileUpload === 'true') {
    responseMessage = 'Task completed successfully without file uploads';
  } else if (files && files.length > 0) {
    if (fileUrls.length === files.length) {
      responseMessage = `Task completed successfully with ${fileUrls.length} file(s) uploaded`;
    } else if (fileUrls.length > 0) {
      responseMessage = `Task completed successfully with ${fileUrls.length} out of ${files.length} file(s) uploaded`;
    } else {
      responseMessage = 'Task completed successfully, but file uploads failed';
    }
  }
  
  res.status(200).json({
    message: responseMessage,
    task,
    fileUploads: {
      requested: files?.length || 0,
      successful: fileUrls.length,
      files: fileUrls.map(f => ({ name: f.originalName, url: f.url }))
    }
  });
});
