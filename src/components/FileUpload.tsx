
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (fileBlob: Blob) => void;
  disabled?: boolean;
  acceptedTypes?: string;
}

export function FileUpload({ onFileUpload, disabled, acceptedTypes = "image/*,application/pdf" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        console.error('Please select an image or PDF file');
        return;
      }

      // Validate file size (max 10MB for PDFs, 5MB for images)
      const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error(`File size must be less than ${isPdf ? '10MB' : '5MB'}`);
        return;
      }

      onFileUpload(file);
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
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
