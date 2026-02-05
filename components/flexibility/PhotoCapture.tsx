"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, RotateCcw, Check } from "lucide-react";
import Image from "next/image";

interface PhotoCaptureProps {
  onCapture: (photoData: string) => void;
  onCancel?: () => void;
  existingPhoto?: string;
}

export default function PhotoCapture({
  onCapture,
  onCancel,
  existingPhoto,
}: PhotoCaptureProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    existingPhoto || null
  );
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("camera");
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(photoData);
        stopCamera();
        setMode("preview");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        setCapturedPhoto(photoData);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
    setMode("idle");
  };

  const confirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  const cancel = () => {
    stopCamera();
    setCapturedPhoto(null);
    setMode("idle");
    onCancel?.();
  };

  // Cleanup on unmount
  // useEffect cleanup handled by the component lifecycle

  if (mode === "camera") {
    return (
      <div className="relative bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-4/3 object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines for alignment */}
          <div className="absolute inset-4 border border-white/30 rounded-lg" />
          <div className="absolute top-1/3 left-4 right-4 border-t border-white/20" />
          <div className="absolute top-2/3 left-4 right-4 border-t border-white/20" />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={cancel}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={capturePhoto}
            className="p-4 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "preview" && capturedPhoto) {
    return (
      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
        <div className="relative aspect-4/3">
          <Image
            src={capturedPhoto}
            alt="Captured photo"
            fill
            className="object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={retake}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Retake</span>
          </button>
          <button
            onClick={confirm}
            className="flex items-center gap-2 px-4 py-2 bg-sage-500 rounded-lg text-white hover:bg-sage-600 transition-colors"
          >
            <Check className="w-5 h-5" />
            <span>Use Photo</span>
          </button>
        </div>
      </div>
    );
  }

  // Idle mode - show options
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <Camera className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">
          Capture a photo to track your progress
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={startCamera}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Image</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {existingPhoto && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Current photo:</p>
          <div className="relative aspect-video max-w-xs mx-auto rounded-lg overflow-hidden">
            <Image
              src={existingPhoto}
              alt="Existing progress photo"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
