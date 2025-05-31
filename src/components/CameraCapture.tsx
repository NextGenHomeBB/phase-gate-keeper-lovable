
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = async () => {
    console.log('Starting camera...');
    setIsLoading(true);
    setHasPermission(null);
    setCameraError(null);
    setIsVideoReady(false);
    
    try {
      let mediaStream: MediaStream;
      
      try {
        // First try with back camera
        const backCameraConstraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(backCameraConstraints);
      } catch (error) {
        console.log('Back camera not available, trying any camera...');
        // Fallback to any available camera
        const fallbackConstraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }
      
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for the video to be ready with proper error handling
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.play()
              .then(() => {
                console.log('Video playing successfully');
                setIsVideoReady(true);
                resolve();
              })
              .catch(reject);
          };
          
          const onError = (error: Event) => {
            console.error('Video error:', error);
            reject(new Error('Video failed to load'));
          };
          
          // Set up event listeners
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
          
          // Cleanup function
          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
          };
          
          // Set a timeout to avoid hanging
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Video loading timeout'));
          }, 10000);
          
          // Modify resolve and reject to cleanup
          const originalResolve = resolve;
          const originalReject = reject;
          resolve = (...args) => {
            clearTimeout(timeout);
            cleanup();
            originalResolve(...args);
          };
          reject = (...args) => {
            clearTimeout(timeout);
            cleanup();
            originalReject(...args);
          };
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      setCameraError(error instanceof Error ? error.message : 'Camera access denied');
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
    setHasPermission(null);
    setCameraError(null);
    setIsVideoReady(false);
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      console.log('Video dimensions at capture:', video.videoWidth, 'x', video.videoHeight);

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Photo captured successfully, blob size:', blob.size);
            onCapture(blob);
            handleClose();
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/jpeg', 0.9);
      } else {
        console.error('Video not ready or invalid dimensions:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          context: !!context,
          isVideoReady
        });
      }
    } else {
      console.error('Video or canvas ref not available, or video not ready:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        isVideoReady
      });
    }
  };

  const handleClose = () => {
    console.log('Closing camera dialog...');
    stopCamera();
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      } else {
        setIsOpen(true);
        startCamera();
      }
    }}>
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
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Camera wordt gestart...</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center text-red-600 py-8">
              <p className="mb-2">Camera toegang geweigerd</p>
              {cameraError && (
                <p className="text-sm text-gray-600 mb-4">{cameraError}</p>
              )}
              <p className="text-sm mb-4">Controleer je browser instellingen en sta camera toegang toe.</p>
              <Button onClick={startCamera} variant="outline">
                Opnieuw proberen
              </Button>
            </div>
          )}
          
          {hasPermission === true && !isLoading && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center space-x-2">
                <Button 
                  onClick={capturePhoto} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!stream || !isVideoReady}
                >
                  Foto maken
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Annuleren
                </Button>
              </div>
              {!isVideoReady && (
                <p className="text-sm text-gray-500 text-center">
                  Video wordt geladen...
                </p>
              )}
            </div>
          )}

          {!isLoading && hasPermission === null && (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Klik op "Foto maken" om de camera te starten</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
