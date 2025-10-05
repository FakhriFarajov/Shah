import React from 'react';
import ImageZoom from '@/components/ui/image-zoom';
import ImageCropDialog from '@/components/ui/image-crop-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploadCropZoomProps {
  croppedImage: string | null;
  previewImage: string;
  fallbackImage?: string;
  selectedFile: File | null;
  cropperOpen: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCropperOpenChange: (open: boolean) => void;
  onCrop: (img: string) => void;
  onReset: () => void;
  setPreviewImage: (url: string) => void;
  label?: string;
  aspect?: number;
  buttonText?: string;
}

const ImageUploadCropZoom: React.FC<ImageUploadCropZoomProps> = ({
  croppedImage,
  previewImage,
  fallbackImage = '',
  selectedFile,
  cropperOpen,
  onFileChange,
  onCropperOpenChange,
  onCrop,
  onReset,
  setPreviewImage,
  label = 'Image',
  aspect = 1,
  buttonText = 'Upload Another Image',
}) => {
  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <Label>{label}</Label>
      <div className="w-28 h-28 rounded-lg border flex items-center justify-center bg-gray-50 mb-2 shadow">
        {croppedImage ? (
          <ImageZoom
            src={croppedImage}
            alt={label + ' Preview'}
            className="w-24 h-24 object-cover rounded"
          />
        ) : (
          <ImageZoom
            src={previewImage || fallbackImage}
            alt={label + ' Preview'}
            className="w-24 h-24 object-cover rounded"
          />
        )}
      </div>
      {!selectedFile && !croppedImage && (
        <Input
          accept="image/*"
          className="w-fit"
          onChange={onFileChange}
          type="file"
        />
      )}
      <ImageCropDialog
        open={cropperOpen}
        onOpenChange={onCropperOpenChange}
        file={selectedFile}
        aspect={aspect}
        onCrop={img => {
          onCrop(img);
          setPreviewImage(img);
        }}
        onReset={onReset}
      />
      {croppedImage && (
        <Button
          onClick={() => {
            onReset();
            setPreviewImage('');
          }}
          size="sm"
          type="button"
          variant="outline"
          className="mt-1"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default ImageUploadCropZoom;
