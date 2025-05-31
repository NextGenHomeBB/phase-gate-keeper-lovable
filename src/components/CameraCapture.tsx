
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
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = async () => {
    console.log('Starting camera...');
    setIsLoading(true);
    setHasPermission(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log('Video element playing');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Photo captured, blob size:', blob.size);
            onCapture(blob);
            handleClose();
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/jpeg', 0.8);
      } else {
        console.error('Video not ready or invalid dimensions');
      }
    } else {
      console.error('Video or canvas ref not available');
    }
  };

  const handleClose = () => {
    console.log('Closing camera dialog...');
    stopCamera();
    setIsOpen(false);
    setHasPermission(null);
    setIsLoading(false);
  };

  const handleOpen = () => {
    console.log('Opening camera dialog...');
    setIsOpen(true);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open) {
        handleOpen();
      } else {
        handleClose();
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="ml-2"
          onClick={(e) => {
            e.preventDefault();
            console.log('Camera button clicked');
          }}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto maken</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center">
              <p>Camera wordt gestart...</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center text-red-600">
              <p>Camera toegang geweigerd. Controleer je browser instellingen.</p>
              <Button onClick={startCamera} className="mt-2" variant="outline">
                Opnieuw proberen
              </Button>
            </div>
          )}
          
          {hasPermission === true && !isLoading && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: '400px' }}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
