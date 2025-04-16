"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { type ClipboardEvent, useRef, useState } from "react";
import { useSubmitPostMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { type Attachment } from "./useMediaUpload";
import CategorySelect from "./CategorySelect";
import RichTextEditor from "./RichTextEditor";
import { useRouter } from "next/navigation";
import RoleSelect from "./RoleSelect";
import type { Category } from "@prisma/client";
import { DocumentUploader } from "./DocumentUploader";

export default function PostEditor() {
  const [contentData, setContentData] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [Role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useSession();

  const mutation = useSubmitPostMutation();
  const router = useRouter();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Jambo! Hakuna Matata...",
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  const [document, setDocument] = useState<File | null>(null);

  function onSubmit() {
    mutation.mutate(
      {
        type: "post",
        input: {
          title: input,
          body: contentData,
          category: category as Category,
          role: Role,
          description: description,
          mediaIds: attachments
            .map((a) => a.mediaId)
            .filter(Boolean) as string[],
          document: document
            ? {
                name: document.name,
                type: document.type,
              }
            : undefined,
        },
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
          setDocument(null);
          router.push("/");
        },
      },
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  const handleDocumentUpload = async (file: File) => {
    setDocument(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const data = await response.json();

      const documentUrl = data.url;
      const documentName = file.name;

      const documentLink = `
        <div class="document-embed">
          <a href="${documentUrl}" target="_blank" rel="noopener noreferrer">
            <div class="document-preview">
              <div class="document-icon">📄</div>
              <div class="document-name">${documentName}</div>
            </div>
          </a>
        </div>
      `;

      setContentData((prevContent) => prevContent + documentLink);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-3 shadow-sm sm:gap-5 sm:rounded-2xl sm:p-5">
      <div className="flex gap-3 sm:gap-5">
        {/* <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" /> */}
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-lg bg-background px-3 py-2 text-sm sm:rounded-2xl sm:px-5 sm:py-3 sm:text-base",
              isDragActive && "outline-dashed",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}

      <CategorySelect
        value={category}
        onChange={(value) => setCategory(value as Category)}
      />

      {user.displayName === "Admin" && (
        <RoleSelect value={Role} onChange={(value) => setRole(value)} />
      )}
      <div className="my-1 w-full sm:my-2">
        <p className="mb-1 text-base text-primary sm:text-lg">
          Short Description
        </p>
        <textarea
          name="description"
          id="description"
          className="h-[150px] w-full rounded-lg bg-background p-2 text-sm outline-none sm:h-[200px] sm:rounded-2xl sm:p-3 sm:text-base"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <DocumentUploader
        onUpload={handleDocumentUpload}
        onRemove={() => setDocument(null)}
        file={document}
      />

      <RichTextEditor
        value={contentData}
        onChange={(value) => setContentData(value)}
      />

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {isUploading && (
          <>
            <span className="text-xs sm:text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-4 animate-spin text-primary sm:size-5" />
          </>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-16 px-2 text-sm sm:min-w-20 sm:px-4 sm:text-base"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary hover:text-primary sm:h-10 sm:w-10"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={18} className="sm:size-20" />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "grid grid-cols-1 sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div className={cn("relative mx-auto w-full", isUploading && "opacity-50")}>
      {file.type.startsWith("image") ? (
        <Image
          src={src || "/placeholder.svg"}
          alt="Attachment preview"
          width={500}
          height={500}
          className="max-h-[20rem] w-full max-w-full rounded-lg object-contain sm:max-h-[30rem] sm:rounded-2xl"
        />
      ) : (
        <video
          controls
          className="max-h-[20rem] w-full max-w-full rounded-lg sm:max-h-[30rem] sm:rounded-2xl"
        >
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-2 top-2 rounded-full bg-foreground p-1 text-background transition-colors hover:bg-foreground/60 sm:right-3 sm:top-3 sm:p-1.5"
        >
          <X size={16} className="sm:size-20" />
        </button>
      )}
    </div>
  );
}
