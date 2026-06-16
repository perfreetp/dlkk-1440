import { useRef } from 'react';
import { Camera, X, Image as ImageIcon, Upload } from 'lucide-react';

interface PhotoCardProps {
  photos: string[];
  onAdd: (photoUrl: string) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoCard({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 3,
  disabled = false
}: PhotoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onAdd(result);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canAdd = photos.length < maxPhotos && !disabled;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 group animate-fade-in"
          >
            <img
              src={photo}
              alt={`照片 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-danger-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {canAdd && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              <Upload size={20} />
              <span className="text-xs">上传</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-coral-400 hover:text-coral-500 hover:bg-coral-50 transition-all duration-200"
            >
              <Camera size={20} />
              <span className="text-xs">拍照</span>
            </button>
          </>
        )}
        {photos.length === 0 && !canAdd && (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-400">
            <ImageIcon size={20} />
          </div>
        )}
      </div>
      {maxPhotos > 1 && (
        <p className="text-xs text-neutral-400">
          已上传 {photos.length}/{maxPhotos} 张照片
        </p>
      )}
    </div>
  );
}
