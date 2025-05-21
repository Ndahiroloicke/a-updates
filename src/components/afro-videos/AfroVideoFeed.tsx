"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useSession } from "@/app/(main)/SessionProvider";
import { Loader2, ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Add styles to hide scrollbars cross-browser
const scrollbarHideStyles = {
  scrollbarWidth: "none", // Firefox
  msOverflowStyle: "none", // IE, Edge
  "&::-webkit-scrollbar": {
    display: "none", // Chrome, Safari, newer Edge
  }
};

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
    // Add dislikes if your API supports it
  };
  likes?: { userId: string }[];
}

interface VideoFeedResponse {
  videos: VideoData[];
  nextCursor: string | null;
}

export default function AfroVideoFeed() {
  const { user } = useSession();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentingVideoId, setCommentingVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [progress, setProgress] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Fetch videos
  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["afro-videos"],
    queryFn: ({ pageParam }) => 
      kyInstance.get("/api/afro-videos", pageParam ? { searchParams: { cursor: pageParam } } : {})
        .json<VideoFeedResponse>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allVideos = data?.pages.flatMap(page => page.videos) || [];
  
  // Set up refs for all videos
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, allVideos.length);
  }, [allVideos.length]);

  const playVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.play().then(() => setIsPlaying(true)).catch(err => console.error("Autoplay failed:", err));
    }
  };

  const pauseVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  const scrollToVideo = (index: number) => {
    if (index < 0 || index >= allVideos.length) return;
    const videoElement = document.querySelector(`[data-index="${index}"]`);
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveVideoIndex(index);
    }
  };

  // Set up intersection observer for video playback
  useEffect(() => {
    if (!allVideos.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8, // 80% visibility
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const targetVideoElement = entry.target as HTMLDivElement;
        const index = parseInt(targetVideoElement.dataset.index || "0");

        if (entry.isIntersecting) {
          setActiveVideoIndex(index);
          videoRefs.current.forEach((video, i) => {
            if (video) {
              if (i === index) {
                video.play().then(() => setIsPlaying(true)).catch(err => {
                  console.error("Autoplay failed:", err);
                  setIsPlaying(false); // Update playing state if autoplay fails
                });
                video.muted = isMuted;
              } else {
                video.pause();
                video.currentTime = 0;
              }
            }
          });
        } else {
           // Fallback in case a video leaves viewport without another entering
           // This might happen with fast scrolls or if only one video is loaded
           if (activeVideoIndex === index) {
             const video = videoRefs.current[index];
             if(video) video.pause();
           }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe all video containers
    const videoElements = document.querySelectorAll(".short-video-item");
    videoElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [allVideos.length, isMuted, containerRef.current]);
  
  useEffect(() => {
    // Ensure the initially active video is played if it exists
    if (allVideos.length > 0 && videoRefs.current[activeVideoIndex]) {
      playVideo(activeVideoIndex);
      videoRefs.current[activeVideoIndex]!.muted = isMuted;
    }
  }, [activeVideoIndex, allVideos.length, isMuted]);

  // Handle scroll detection for infinite loading
  const handleScroll = () => {
    if (!containerRef.current || isFetchingNextPage || !hasNextPage) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // When user scrolls to 50% from the bottom, fetch more videos
    if (scrollTop + clientHeight >= scrollHeight - clientHeight * 0.5) {
      fetchNextPage();
    }
  };
  
  // Handle like action
  const handleLike = async (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in to like videos", variant: "destructive" });
      return;
    }

    try {
      await kyInstance.post(`/api/afro-videos/${videoId}/like`).json();
      toast({ title: "Liked!" });
    } catch (error) {
      toast({ title: "Failed to like video", variant: "destructive" });
    }
  };

  // Handle dislike action
  const handleDislike = async (videoId: string) => {
    // Placeholder for dislike functionality
    toast({ title: "Dislike clicked (not implemented)"});
  };

  // Show comments for a video
  const handleComment = (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    
    setCommentingVideoId(videoId);
    setShowComments(true);
  };

  // Share a video
  const handleShare = async (videoId: string) => {
    const videoUrl = `${window.location.origin}/afro-videos/${videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: allVideos.find(v=>v.id === videoId)?.title || "Check out this video!", url: videoUrl });
        await kyInstance.post(`/api/afro-videos/${videoId}/share`, { json: { destination: "external" } }).json();
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({ title: "Failed to share video", variant: "destructive" });
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(videoUrl);
      toast({ title: "Link copied to clipboard!" });
      
      // Still record the share
      await kyInstance.post(`/api/afro-videos/${videoId}/share`, { json: { destination: "clipboard" } }).json();
    }
  };
  
  const togglePlayPause = () => {
    const video = videoRefs.current[activeVideoIndex];
    if (video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRefs.current[activeVideoIndex];
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleProgress = () => {
    const video = videoRefs.current[activeVideoIndex];
    if (video) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };
  
  const seekVideo = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const video = videoRefs.current[activeVideoIndex];
    const progressBar = event.currentTarget;
    if(video && progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const newTime = (offsetX / progressBar.offsetWidth) * video.duration;
        video.currentTime = newTime;
        setProgress((newTime / video.duration) * 100);
    }
  };
  
  if (status === "pending") {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }
  
  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load videos. Please try again later.</p>
      </div>
    );
  }

  if (allVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">No videos available right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-white">
      <div 
        ref={containerRef}
        className="relative h-[calc(100vh-56px)] max-h-[100vh] w-full max-w-[420px] overflow-y-scroll scroll-smooth snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allVideos.map((video, index) => (
          <div
            key={video.id}
            data-index={index}
            className="short-video-item h-full w-full snap-start snap-always flex-shrink-0 relative bg-gray-900"
          >
            <video
              ref={el => videoRefs.current[index] = el}
              className="w-full h-full object-contain"
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              loop
              playsInline // Important for mobile autoplay
              muted={isMuted}
              onTimeUpdate={handleProgress}
              onClick={togglePlayPause} // Click on video to play/pause
              onLoadedMetadata={() => { // Ensure video is playable on load for observer
                if(index === activeVideoIndex && isPlaying) {
                   videoRefs.current[index]?.play().catch(e => console.log("Metadata play failed", e));
                }
              }}
            />

            {/* Video Controls Overlay - Top */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-white hover:bg-white/20">
                        {isPlaying && index === activeVideoIndex ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </Button>
                  </div>
                {/* Autoplay toggle - can be added later */}
            </div>
            
            {/* Video Progress Bar - Bottom */}
             <div className="absolute bottom-14 left-0 right-0 px-3 z-10 h-4 flex items-center">
                <div className="w-full h-1 bg-white/30 rounded-full cursor-pointer" onClick={seekVideo}>
                    <div 
                        className="h-full bg-red-600 rounded-full" 
                        style={{ width: `${index === activeVideoIndex ? progress : 0}%` }}
                    />
                </div>
                </div>

            {/* Video Info Overlay - Bottom Left */}
            <div className="absolute bottom-0 left-0 w-full p-3 pb-16 bg-gradient-to-t from-black/70 to-transparent z-10">
              <div className="flex items-center mb-1">
                {video.user.avatarUrl && (
                  <img src={video.user.avatarUrl} alt={video.user.displayName || video.user.username} className="w-8 h-8 rounded-full mr-2 border border-white/30"/>
                )}
                <span className="text-white text-sm font-semibold">{video.user.displayName || video.user.username}</span>
              </div>
              <h3 className="text-white text-sm line-clamp-2">{video.title}</h3>
            </div>
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center py-4 bg-black/50">
            <Loader2 className="animate-spin text-white w-6 h-6" />
          </div>
        )}
      </div>
      
      {/* Interaction Buttons - Right Side of the player container */}
      {allVideos.length > 0 && allVideos[activeVideoIndex] && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4 z-20 p-4 bg-gray-50/20 backdrop-blur-sm rounded-l-xl">
            {/* Like */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => handleLike(allVideos[activeVideoIndex].id)}>
                <ThumbsUp size={24} />
                <span className="text-xs mt-1">{formatNumber(allVideos[activeVideoIndex]._count.likes)}</span>
            </Button>
            {/* Dislike - Placeholder */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => handleDislike(allVideos[activeVideoIndex].id)}>
                <ThumbsDown size={24} />
                <span className="text-xs mt-1">Dislike</span>
            </Button>
            {/* Comment */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => handleComment(allVideos[activeVideoIndex].id)}>
                <MessageCircle size={24} />
                <span className="text-xs mt-1">{formatNumber(allVideos[activeVideoIndex]._count.comments)}</span>
            </Button>
            {/* Share */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => handleShare(allVideos[activeVideoIndex].id)}>
                <Share2 size={24} />
                <span className="text-xs mt-1">Share</span>
            </Button>
            {/* More Options */}
            <Button variant="ghost" size="icon" className="h-auto p-2 text-gray-800 hover:bg-gray-100 rounded-full">
                <MoreVertical size={24} />
            </Button>
        </div>
      )}
      
      {/* Up/Down Navigation Arrows - Centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-20 flex flex-col h-full justify-between py-20 pointer-events-none">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-800 bg-white/70 hover:bg-white/90 rounded-full p-2 pointer-events-auto"
          onClick={() => scrollToVideo(activeVideoIndex - 1)}
          disabled={activeVideoIndex === 0}
        >
          <ChevronUp size={20} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-800 bg-white/70 hover:bg-white/90 rounded-full p-2 pointer-events-auto"
          onClick={() => scrollToVideo(activeVideoIndex + 1)}
          disabled={activeVideoIndex === allVideos.length - 1 || isFetchingNextPage}
        >
          <ChevronDown size={20} />
        </Button>
      </div>

      {/* Comments Overlay */}
      {showComments && commentingVideoId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowComments(false)}
        >
          <div 
            className="bg-neutral-900 p-6 rounded-lg shadow-xl w-full max-w-md text-white"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl">Comments</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowComments(false)} className="text-neutral-400 hover:text-white">✕</Button>
            </div>
            <div className="h-64 overflow-y-auto">
              {/* Replace with actual comments loading and rendering */}
              <p className="text-center text-neutral-400 py-10">Comments for this video will appear here.</p>
          </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}