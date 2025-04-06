"use client"

import { useSession } from "@/app/(main)/SessionProvider"
import LoadingButton from "@/components/LoadingButton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useDropzone } from "@uploadthing/react"
import { ImageIcon, Loader2, X } from "lucide-react"
import Image from "next/image"
import { type ClipboardEvent, useRef, useState } from "react"
import { useSubmitPostMutation } from "./mutations"
import "./styles.css"
import useMediaUpload, { type Attachment } from "./useMediaUpload"
import CategorySelect from "./CategorySelect"
import RichTextEditor from "./RichTextEditor"
import { useRouter } from "next/navigation"
import RoleSelect from "./RoleSelect"
import type { Category } from "@prisma/client"

export default function PostEditor() {
  const [contentData, setContentData] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [Role, setRole] = useState("")
  const [description, setDescription] = useState("")
  const { user } = useSession()

  const mutation = useSubmitPostMutation()
  const router = useRouter()

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  })

  const { onClick, ...rootProps } = getRootProps()

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
  })

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || ""

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
          mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        },
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent()
          resetMediaUploads()
          router.push("/")
        },
      },
    )
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[]
    startUpload(files)
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-5 rounded-lg sm:rounded-2xl bg-card p-3 sm:p-5 shadow-sm">
      <div className="flex gap-3 sm:gap-5">
        {/* <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" /> */}
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-lg sm:rounded-2xl bg-background px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base",
              isDragActive && "outline-dashed",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && <AttachmentPreviews attachments={attachments} removeAttachment={removeAttachment} />}

      <CategorySelect value={category} onChange={(value) => setCategory(value)} />

      {user.displayName === "Admin" && <RoleSelect value={Role} onChange={(value) => setRole(value)} />}
      <div className="my-1 sm:my-2 w-full">
        <p className="text-primary text-base sm:text-lg mb-1">Short Description</p>
        <textarea
          name=""
          id=""
          className="h-[150px] sm:h-[200px] outline-none p-2 sm:p-3 w-full bg-background rounded-lg sm:rounded-2xl text-sm sm:text-base"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <RichTextEditor value={contentData} onChange={(value: any) => setContentData(value)} />

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {isUploading && (
          <>
            <span className="text-xs sm:text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-4 sm:size-5 animate-spin text-primary" />
          </>
        )}
        <AddAttachmentsButton onFilesSelected={startUpload} disabled={isUploading || attachments.length >= 5} />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-16 sm:min-w-20 text-sm sm:text-base px-2 sm:px-4"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  )
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void
  disabled: boolean
}

function AddAttachmentsButton({ onFilesSelected, disabled }: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary h-8 w-8 sm:h-10 sm:w-10"
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
          const files = Array.from(e.target.files || [])
          if (files.length) {
            onFilesSelected(files)
            e.target.value = ""
          }
        }}
      />
    </>
  )
}

interface AttachmentPreviewsProps {
  attachments: Attachment[]
  removeAttachment: (fileName: string) => void
}

function AttachmentPreviews({ attachments, removeAttachment }: AttachmentPreviewsProps) {
  return (
    <div className={cn("flex flex-col gap-3", attachments.length > 1 && "grid grid-cols-1 sm:grid-cols-2")}>
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  )
}

interface AttachmentPreviewProps {
  attachment: Attachment
  onRemoveClick: () => void
}

function AttachmentPreview({ attachment: { file, mediaId, isUploading }, onRemoveClick }: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file)

  return (
    <div className={cn("relative mx-auto w-full", isUploading && "opacity-50")}>
      {file.type.startsWith("image") ? (
        <Image
          src={src || "/placeholder.svg"}
          alt="Attachment preview"
          width={500}
          height={500}
          className="w-full max-w-full max-h-[20rem] sm:max-h-[30rem] rounded-lg sm:rounded-2xl object-contain"
        />
      ) : (
        <video controls className="w-full max-w-full max-h-[20rem] sm:max-h-[30rem] rounded-lg sm:rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-foreground p-1 sm:p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={16} className="sm:size-20" />
        </button>
      )}
    </div>
  )
}

