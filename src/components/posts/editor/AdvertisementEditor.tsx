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
import { ClipboardEvent, useRef, useState } from "react";
import { useSubmitAdvertisementMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { useRouter } from "next/navigation";

const adLocations = [
  { value: "Homepage", label: "Homepage" },
  { value: "Article Pages", label: "Article Pages" },
  { value: "Sidebar", label: "Sidebar" },
  { value: "Mobile App", label: "Mobile App" }
];

const adTypes = [
  { value: "banner", label: "Banner Ads" },
  { value: "video", label: "Video Ads" },
  { value: "native", label: "Native Ads" },
  { value: "sponsored", label: "Sponsored Content" }
];

export default function AdvertisementEditor() {
  const [adName, setAdName] = useState("")
  const [adLocation, setAdLocation] = useState("")
  const [adType, setAdType] = useState("")
  const { user } = useSession();
  const router = useRouter();

  const mutation = useSubmitAdvertisementMutation();

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
    maxFiles: 1,
  });

  const { onClick, ...rootProps } = getRootProps();

  function onSubmit() {
    if (!attachments[0]?.mediaId) return;
    
    mutation.mutate(
      {
        name: adName,
        location: adLocation,
        type: adType,
        mediaId: attachments[0].mediaId,
      },
      {
        onSuccess: () => {
          resetMediaUploads();
          setAdName("");
          setAdLocation("");
          setAdType("");
          router.push("/dashboard/advertisements")
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

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Advertisement Name
          </label>
          <input
            type="text"
            value={adName}
            onChange={(e) => setAdName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white"
            placeholder="Enter advertisement name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Advertisement Location
          </label>
          <select
            value={adLocation}
            onChange={(e) => setAdLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select location</option>
            {adLocations.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Advertisement Type
          </label>
          <select
            value={adType}
            onChange={(e) => setAdType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select type</option>
            {adTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div {...rootProps} className="mt-4">
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center",
            isDragActive && "border-green-500 bg-green-50 dark:bg-green-900/20"
          )}
        >
          <input {...getInputProps()} />
          {attachments.length === 0 && (
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Drag & drop your advertisement media here, or click to select
              </p>
            </div>
          )}
        </div>
      </div>

      {!!attachments.length && (
        <AttachmentPreviews
          attachment={attachments[0]}
          removeAttachment={removeAttachment}
        />
      )}

      <div className="flex items-center justify-end gap-3 mt-4">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!adName || !adLocation || !adType || !attachments.length || isUploading}
          className="min-w-20"
        >
          Publish Advertisement
        </LoadingButton>
      </div>
    </div>
  );
}

// Reuse the existing AttachmentPreview components... 