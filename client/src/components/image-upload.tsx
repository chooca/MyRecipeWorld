import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  imageUrl?: string;
  isLoading?: boolean;
}

export default function ImageUpload({ onUpload, imageUrl, isLoading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      onUpload(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    // This would need to be implemented to clear the image
    // For now, we'll just trigger the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Recipe"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearImage}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? "border-recipe-orange bg-orange-50"
              : "border-gray-300 hover:border-recipe-orange"
          }`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-recipe-orange animate-pulse mb-4" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
