"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import Link from "next/link";

export default function AfroVideoUploadPage() {
  const router = useRouter();
  const { user } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check if user is admin
  if (user && user.role !== "ADMIN" && user.role !== "SUB_ADMIN") {
    router.replace("/afro-video");
    return null;
  }

  // Handle video drop
  const onVideoDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle thumbnail drop
  const onThumbnailDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Video dropzone
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onVideoDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  // Thumbnail dropzone
  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  // Upload hook
  const { startUpload } = useUploadThing("attachment", {
    onClientUploadComplete: () => {
      setUploadProgress(100);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !videoFile) {
      toast({ title: "Missing required fields", description: "Title, description and video are required", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);

      // Upload video first
      let videoRes, thumbnailRes;
      
      if (videoFile) {
        videoRes = await startUpload([videoFile]);
        if (!videoRes || !videoRes[0]) {
          throw new Error("Video upload failed");
        }
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        thumbnailRes = await startUpload([thumbnailFile]);
      }

      // Create video entry
      const response = await kyInstance.post("/api/afro-videos/upload", {
        json: {
          title,
          description,
          videoUrl: videoRes![0].url,
          thumbnailUrl: thumbnailRes?.[0]?.url,
          category: category || undefined,
        },
      }).json();

      toast({ title: "Video uploaded successfully!" });
      router.push("/afro-video");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Failed to upload video", description: "Please try again later", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8 px-4 bg-white">
      <header className="mb-6 flex items-center">
        <Link href="/afro-video" className="text-gray-800 hover:text-gray-600 mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Upload Short Video</h1>
      </header>

      <Card className="bg-white text-gray-800 border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Upload Afro Video</CardTitle>
          <CardDescription className="text-gray-500">Add a new video to the AfroVideos feed. Only admins can upload videos.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
                className="bg-white border-gray-300 text-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the video content"
                rows={4}
                required
                className="bg-white border-gray-300 text-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-800">
                  {Object.values(CATEGORY_OPTIONS).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video upload */}
              <div className="space-y-2">
                <Label className="text-gray-700">Video Upload</Label>
                <div 
                  {...getVideoRootProps()} 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input {...getVideoInputProps()} />
                  {videoPreviewUrl ? (
                    <video 
                      src={videoPreviewUrl} 
                      className="h-full max-h-28 object-contain" 
                      controls
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag & drop a video file or click to select
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: MP4, WebM, MOV (max 100MB)
                </p>
              </div>
              
              {/* Thumbnail upload */}
              <div className="space-y-2">
                <Label className="text-gray-700">Thumbnail (Optional)</Label>
                <div 
                  {...getThumbnailRootProps()} 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input {...getThumbnailInputProps()} />
                  {thumbnailPreviewUrl ? (
                    <img 
                      src={thumbnailPreviewUrl} 
                      className="h-full max-h-28 object-contain" 
                      alt="Thumbnail preview" 
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag & drop a thumbnail image or click to select
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, WebP (max 5MB)
                </p>
              </div>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-gray-200 pt-4">
          <Button variant="outline" onClick={() => router.push("/afro-video")} className="hover:bg-gray-100 text-gray-800 border-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || !videoFile || !title || !description}
            className="ml-auto bg-primary hover:bg-primary/90 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Video"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 