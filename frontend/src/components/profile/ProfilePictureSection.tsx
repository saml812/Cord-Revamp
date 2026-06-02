import { useState } from "react";
import { Camera } from "lucide-react";

type Props = {
  src: string;
  isOnline: boolean;
  isUploading: boolean;
  onUploadBase64: (base64Image: string) => Promise<void>;
};

export default function ProfilePictureSection({
  src,
  isOnline,
  isUploading,
  onUploadBase64,
}: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result as string;
      setUploadError(null);
      await onUploadBase64(base64Image);
    };

    reader.onerror = () => {
      setUploadError("Error reading file");
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="relative">
          <img
            src={src}
            alt="Profile"
            className="size-32 rounded-full object-fill border-4 border-primary/20 shadow-md"
          />
          <span
            aria-label={isOnline ? "Online" : "Offline"}
            className={[
              "absolute bottom-1 right-1 size-4 rounded-full border-2",
              "border-base-100",
              isOnline ? "bg-emerald-500" : "bg-slate-500",
            ].join(" ")}
          />
        </div>

        <label
          htmlFor="avatar-upload"
          className={`
            absolute bottom-0 right-0 
            bg-primary hover:bg-primary-focus
            p-2 rounded-full cursor-pointer 
            transition-all duration-200 shadow-md
            ${isUploading ? "animate-pulse pointer-events-none" : ""}
          `}
          title="Change profile picture"
        >
          <Camera className="w-5 h-5 text-base-100" />
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <p className="text-sm text-base-content/60">
        {isUploading ? "Uploading..." : "Click the camera icon to update your photo"}
      </p>

      {uploadError && (
        <div className="p-2 bg-error/20 text-error rounded-lg text-sm">{uploadError}</div>
      )}
    </div>
  );
}

