import { useState, useRef, ChangeEvent } from 'react';
import { X, Image, Loader2 } from 'lucide-react';
import api from '../../api/client';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export const ImageUpload = ({ onImageUploaded, currentImage, className = '' }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Clear previous errors
    setError(null);
    setIsUploading(true);

    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'employees'); // Set the folder name

      // For profile images, use the user avatar endpoint
      const isProfileImage = className.includes('profile');
      
      let response;
      if (isProfileImage) {
        response = await api.put('/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/uploads/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Pass the image URL to the parent component
      onImageUploaded(response.data.avatarUrl || response.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded(''); // Clear the image URL in the parent component
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload ${className}`}>
      {previewUrl ? (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
          <button 
            type="button"
            className="remove-image"
            onClick={handleRemoveImage}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="upload-button"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <Image size={24} />
              <span>Upload Image</span>
            </>
          )}
        </button>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden-input"
      />
      
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};
