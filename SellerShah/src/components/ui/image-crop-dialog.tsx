import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from '@/components/ui/image-crop';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onCrop: (img: string) => void;
  onReset: () => void;
  aspect?: number;
}
export function ImageCropDialog({
  open,
  onOpenChange,
  file,
  onCrop,
  onReset,
  aspect = 1,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<any>(undefined); // Accept crop object from library
  const [initialCrop, setInitialCrop] = useState<any>(undefined);
  const [notSquare, setNotSquare] = useState(false);

  useEffect(() => {
    if (!file) {
      setCrop(undefined);
      setInitialCrop(undefined);
      return;
    }
    const img = new window.Image();
    img.onload = function () {
      if (img.width !== img.height) {
        setNotSquare(true);
        setCrop(undefined);
        setInitialCrop(undefined);
      } else {
        setNotSquare(false);
        const squareCrop = {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          unit: '%',
        };
        setCrop(squareCrop);
        setInitialCrop(squareCrop);
      }
    };
    img.src = URL.createObjectURL(file);
  }, [file]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] h-[500px] p-0 flex items-center justify-center">
        {file && notSquare && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-red-600 font-semibold text-center">Only square images are allowed.<br />Please select a square image.</div>
            <Button className="mt-4" onClick={() => { onOpenChange(false); onReset(); }}>Close</Button>
          </div>
        )}
        {file && !notSquare && (
          <div className="space-y-4 w-full h-full flex flex-col items-center justify-center">
            <ImageCrop
              aspect={1}
              file={file}
              crop={crop}
              maxImageSize={1024 * 1024}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              onComplete={console.log}
              onCrop={img => {
                onCrop(img);
                onOpenChange(false);
              }}
              style={{ width: 400, height: 400, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ImageCropContent className="max-w-full max-h-full" />
              <div className="flex items-center gap-2">
                <ImageCropApply asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => {
                    onCrop(crop);
                    onOpenChange(false);
                  }}>
                    <Check className="w-4 h-4" /> Apply Crop
                  </Button>
                </ImageCropApply>
                <ImageCropReset asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => initialCrop && setCrop(initialCrop)}>
                    <RefreshCw className="w-4 h-4" /> Reset
                  </Button>
                </ImageCropReset>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onReset();
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </ImageCrop>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ImageCropDialog;
