
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageBlob: Blob) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size must be less than 5MB');
        return;
      }

      onImageUpload(file);
    }
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleButtonClick}
        className="ml-2"
      >
        <Upload className="w-4 h-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
