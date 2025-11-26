import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImage } from '../config/cloudinary';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';

/**
 * Upload a file to Cloudinary
 * If Cloudinary is not configured, returns a local URL
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  // Check if file exists
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { folder = 'employees' } = req.body;
  const filePath = req.file.path;

  try {
    // If Cloudinary is configured, upload the file
    if (env.isCloudinaryConfigured) {
      const result = await uploadImage(filePath, folder);
      
      // Delete the local file after successful upload
      fs.unlinkSync(filePath);
      
      return res.json({
        url: result.secure_url,
        publicId: result.public_id,
        message: 'File uploaded successfully to Cloudinary',
      });
    } 
    
    // If Cloudinary is not configured, return the local file path
    // This is just for development purposes
    const localUrl = `/uploads/${path.basename(filePath)}`;
    
    return res.json({
      url: localUrl,
      message: 'File uploaded locally (Cloudinary not configured)',
    });
  } catch (error) {
    // Clean up the file if upload failed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Failed to upload file' });
  }
});

/**
 * Delete a file from Cloudinary
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.params;

  // Check if Cloudinary is configured
  if (!env.isCloudinaryConfigured) {
    return res.status(400).json({ message: 'Cloudinary not configured' });
  }

  // Validate publicId
  if (!publicId) {
    return res.status(400).json({ message: 'Public ID is required' });
  }

  try {
    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({
      message: 'File deleted successfully',
      result,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete file' });
  }
});
