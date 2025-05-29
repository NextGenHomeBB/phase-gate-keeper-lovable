
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
            handleClose();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setHasPermission(null);
  };

  const handleOpen = () => {
    setIsOpen(true);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? handleOpen() : handleClose()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="ml-2"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto maken</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {hasPermission === false && (
            <div className="text-center text-red-600">
              <p>Camera toegang geweigerd. Controleer je browser instellingen.</p>
            </div>
          )}
          
          {hasPermission === true && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center space-x-2">
                <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                  Foto maken
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}
          
          {hasPermission === null && stream === null && (
            <div className="text-center">
              <p>Camera wordt gestart...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
