
import React from 'react';

interface ImageUploadProps {
  onImageUpload: (imageBlob: Blob) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled }: ImageUploadProps) {
  return null;
}
