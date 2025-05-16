// src/components/posts/editor/DocumentUploader.tsx

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, X } from "lucide-react";

interface DocumentUploaderProps {
  onUpload: (file: File) => void;
  onRemove: () => void;
  file: File | null;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  onRemove,
  file,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setIsUploading(true);
      onUpload(selectedFile);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || !!file}
      >
        <FileIcon className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />
      {file && (
        <div className="flex items-center gap-2">
          <span className="text-sm">{file.name}</span>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
