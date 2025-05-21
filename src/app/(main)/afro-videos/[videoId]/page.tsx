"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { Loader2, ChevronLeft, MessageCircle, Heart, Share2, Repeat, View, Play, Pause, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { TranslationProvider } from "@/contexts/TranslationContext";

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views: number;
  shares: number;
  reposts: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likes?: { userId: string }[];
}

export default function VideoPage() {
  const { videoId } = useParams();
  const router = useRouter();
  const { user } = useSession();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch video details
  const { data: video, isLoading: loadingVideo, isError: videoError } = useQuery({
    queryKey: ['afro-video', videoId],
    queryFn: async () => {
      const data = await kyInstance.get(`/api/afro-videos/${videoId}`).json<VideoData>();
      return data;
    },
  });

  // Fetch comments
  const { 
    data: comments = [], 
    isLoading: loadingComments,
    isError: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['afro-video-comments', videoId],
    queryFn: async () => {
      const data = await kyInstance.get(`/api/afro-videos/${videoId}/comment`).json<CommentType[]>();
      return data;
    },
  });

  // Set initial like state
  useEffect(() => {
    if (video && user) {
      const liked = video.likes?.some((like) => like.userId === user.id) || false;
      setIsLiked(liked);
      setLikesCount(video._count.likes);
    }
  }, [video, user]);

  // Track view
  useEffect(() => {
    const trackView = async () => {
      try {
        await kyInstance.post(`/api/afro-videos/${videoId}/view`).json();
      } catch (error) {
        // Silently fail - view tracking is non-critical
      }
    };
    
    trackView();
  }, [videoId]);

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Like a video
  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please sign in to like videos", variant: "destructive" });
      return;
    }

    try {
      const response = await kyInstance.post(`/api/afro-videos/${videoId}/like`).json<{ liked: boolean }>();
      setIsLiked(response.liked);
      setLikesCount(prev => response.liked ? prev + 1 : prev - 1);
    } catch (error) {
      toast({ title: "Failed to like video", variant: "destructive" });
    }
  };

  // Share video
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title || "Check out this video!",
          text: "Watch this awesome video on Afro Videos",
          url: `${window.location.origin}/afro-videos/${videoId}`,
        });
        
        // Record the share in the backend
        await kyInstance.post(`/api/afro-videos/${videoId}/share`, {
          json: { destination: "external" },
        }).json();
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({ title: "Failed to share video", variant: "destructive" });
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(`${window.location.origin}/afro-videos/${videoId}`);
      toast({ title: "Link copied to clipboard!" });
      
      // Still record the share
      await kyInstance.post(`/api/afro-videos/${videoId}/share`, {
        json: { destination: "clipboard" },
      }).json();
    }
  };

  // Post comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    
    if (!comment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await kyInstance.post(`/api/afro-videos/${videoId}/comment`, {
        json: { content: comment },
      }).json();
      
      setComment("");
      refetchComments();
    } catch (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingVideo) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <p className="text-destructive mb-4">Failed to load video.</p>
        <Button asChild variant="outline">
          <Link href="/afro-videos">
            <ChevronLeft className="mr-2" />
            Back to videos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <TranslationProvider>
      <div className="flex h-[calc(100vh-5rem)] bg-black">
        {/* Close button */}
        <button
          onClick={() => router.push('/afro-videos')}
          className="absolute top-4 left-4 z-50 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/50"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Video column (left side) */}
        <div className="relative w-full md:w-[calc(100%-350px)] h-full flex items-center justify-center bg-black overflow-hidden">
          <div className="relative aspect-[9/16] h-full max-h-full flex items-center justify-center" onClick={togglePlay}>
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              className="h-full max-h-full w-auto mx-auto object-contain"
              autoPlay
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Play/pause overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            {/* Video info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h1 className="text-xl font-bold text-white mb-2">{video.title}</h1>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={video.user.avatarUrl || undefined} alt={video.user.displayName || video.user.username} />
                  <AvatarFallback>{(video.user.displayName || video.user.username).substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{video.user.displayName || video.user.username}</p>
                  <p className="text-xs text-white/70">{formatDistanceToNow(new Date(video.createdAt))} ago</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile action buttons (shown on small screens) */}
          <div className="md:hidden absolute right-4 bottom-24 flex flex-col items-center gap-6">
            <button onClick={handleLike} className="flex flex-col items-center">
              <div className={cn(
                "h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center",
                isLiked && "text-red-500"
              )}>
                <Heart className={cn("h-6 w-6 text-white", isLiked && "fill-current text-red-500")} />
              </div>
              <span className="text-xs text-white mt-1">{likesCount}</span>
            </button>
            
            <button onClick={() => document.getElementById('comment-input')?.focus()} className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-white mt-1">{video._count.comments}</span>
            </button>
            
            <button onClick={handleShare} className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-white mt-1">{video.shares}</span>
            </button>
          </div>
        </div>

        {/* Comments column (right side) - Only visible on md screens and above */}
        <div className="hidden md:flex flex-col w-[350px] h-full bg-white dark:bg-gray-900 overflow-hidden border-l border-gray-200 dark:border-gray-800">
          {/* Video info section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-bold text-lg line-clamp-2">{video.title}</h2>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={video.user.avatarUrl || undefined} alt={video.user.displayName || video.user.username} />
                  <AvatarFallback>{(video.user.displayName || video.user.username).substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{video.user.displayName || video.user.username}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <View className="w-4 h-4 mr-1" />
                <span>{video.views}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">
              {video.description}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-around p-2 border-b border-gray-200 dark:border-gray-800">
            <button 
              onClick={handleLike}
              className={cn(
                "flex flex-col items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              <span className="text-xs mt-1">{likesCount}</span>
            </button>
            
            <button 
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="flex flex-col items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">{video._count.comments}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex flex-col items-center py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs mt-1">{video.shares}</span>
            </button>
          </div>
          
          {/* Comments section */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">{video._count.comments} Comments</h3>
            
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin w-6 h-6 text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatarUrl || undefined} alt={comment.user.displayName || comment.user.username} />
                      <AvatarFallback>{(comment.user.displayName || comment.user.username).substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.user.displayName || comment.user.username}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Comment input */}
          <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <Input
                id="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
                disabled={isSubmitting || !user}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting || !comment.trim() || !user}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TranslationProvider>
  );
} 