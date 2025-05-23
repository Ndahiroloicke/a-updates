"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useSession } from "@/app/(main)/SessionProvider";
import { Loader2, ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, Repeat, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import VideoAd from './VideoAd';
import { cn } from "@/lib/utils";
import React from "react";

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
    retweets: number;
  };
  likes?: { userId: string }[];
  retweets: {
    id: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }[];
}

interface VideoFeedResponse {
  videos: VideoData[];
  nextCursor: string | null;
}

// Add ads array after VideoData interface
const ads = [
  {
    id: "1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  {
    id: "2",
    imageSrc: "/luka.jpg",
    link: "https://example.com/ad2",
    alt: "Special Offer Advertisement",
  },
  {
    id: "3",
    imageSrc: "/ad2.jpg",
    link: "https://example.com/ad3",
    alt: "Limited Time Deal Advertisement",
  },
];

export default function AfroVideoFeed() {
  const { user } = useSession();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentingVideoId, setCommentingVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [progress, setProgress] = useState(0);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [retweetedVideos, setRetweetedVideos] = useState<Set<string>>(() => new Set());
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }>>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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
  const handleComment = async (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    
    setCommentingVideoId(videoId);
    setShowComments(true);
    await fetchComments(videoId);
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
  
  // Update the handleRetweet function
  const handleRetweet = async (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in to retweet videos", variant: "destructive" });
      return;
    }

    try {
      const response = await kyInstance.post(`/api/afro-videos/${videoId}/retweet`).json<{
        retweeted: boolean;
        retweets: number;
      }>();
      
      // Update local state for retweeted status
      setRetweetedVideos(prev => {
        const newSet = new Set(prev);
        if (response.retweeted) {
          newSet.add(videoId);
          toast({ title: "Video retweeted!" });
        } else {
          newSet.delete(videoId);
          toast({ title: "Retweet removed" });
        }
        return newSet;
      });

      // Update the video's retweet count in the allVideos array
      const updatedVideos = data?.pages.map(page => ({
        ...page,
        videos: page.videos.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              _count: {
                ...video._count,
                retweets: response.retweets
              }
            };
          }
          return video;
        })
      }));

      if (updatedVideos) {
        // @ts-ignore - Type mismatch is expected but safe in this case
        data.pages = updatedVideos;
      }
    } catch (error) {
      console.error("Retweet error:", error);
      toast({ title: "Failed to retweet video", variant: "destructive" });
    }
  };

  // Add function to fetch comments
  const fetchComments = async (videoId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await kyInstance.get(`/api/afro-videos/${videoId}/comment`).json<Array<{
        id: string;
        content: string;
        createdAt: string;
        user: {
          id: string;
          username: string;
          displayName: string;
          avatarUrl: string | null;
        };
      }>>();
      setComments(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Add function to post comment
  const handlePostComment = async (videoId: string) => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await kyInstance.post(`/api/afro-videos/${videoId}/comment`, {
        json: { content: newComment },
      }).json();
      
      setNewComment("");
      fetchComments(videoId);
    } catch (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
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
    <div className="h-full w-full flex items-center justify-center bg-white overflow-hidden">
      <div className={cn(
        "relative h-[calc(100vh-56px)] flex transition-all duration-300 ease-in-out max-w-[1200px] mx-auto",
        showComments ? "w-[900px]" : "w-[420px]"
      )}>
        {/* Video Feed Container */}
        <div 
          ref={containerRef}
          className={cn(
            "relative h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory transition-all duration-300 ease-in-out",
            showComments ? "w-[500px]" : "w-full"
          )}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allVideos.map((video, index) => (
            <React.Fragment key={`${video.id}-container`}>
              <div
                data-index={index}
                className="short-video-item h-full w-full snap-start snap-always flex-shrink-0 relative bg-gray-900"
              >
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[index] = el;
                    }
                  }}
                  className="w-full h-full object-contain"
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  loop
                  playsInline // Important for mobile autoplay
                  muted={isMuted}
                  onTimeUpdate={handleProgress}
                  onClick={togglePlayPause}
                  onLoadedMetadata={() => {
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
                  {video.retweets && video.retweets.length > 0 && (
                    <div className="flex items-center mb-2">
                      <Repeat className="w-4 h-4 text-white mr-1" />
                      <span className="text-white text-xs">
                        Reposted by {video.retweets[0].user.displayName || video.retweets[0].user.username}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center mb-1">
                    {video.user.avatarUrl && (
                      <img src={video.user.avatarUrl} alt={video.user.displayName || video.user.username} className="w-8 h-8 rounded-full mr-2 border border-white/30"/>
                    )}
                    <span className="text-white text-sm font-semibold">{video.user.displayName || video.user.username}</span>
                  </div>
                  <h3 className="text-white text-sm line-clamp-2">{video.title}</h3>
                </div>
              </div>
              
              {/* Ad logic */}
              {index === 2 && ads[0] && !dismissedAds.has(ads[0].id) && (
                <div
                  key={`ad-${ads[0].id}-${index}`}
                  className="h-full w-full snap-start snap-always flex-shrink-0 relative bg-gray-900"
                >
                  <VideoAd
                    {...ads[0]}
                    onClose={() => {
                      setDismissedAds(prev => {
                        const newSet = new Set(prev);
                        newSet.add(ads[0].id);
                        return newSet;
                      });
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
          {isFetchingNextPage && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center py-4 bg-black/50">
              <Loader2 className="animate-spin text-white w-6 h-6" />
            </div>
          )}
        </div>

        {/* Comments Side Panel */}
        <div className={cn(
          "h-full border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out",
          showComments ? "w-[400px] opacity-100" : "w-0 opacity-0"
        )}>
          {showComments && commentingVideoId && (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-lg font-semibold">Comments</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowComments(false)} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-4" />
                    <p>No comments yet</p>
                    <p className="text-sm">Start the conversation</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        {comment.user.avatarUrl ? (
                          <img
                            src={comment.user.avatarUrl}
                            alt={comment.user.displayName || comment.user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">
                              {(comment.user.displayName || comment.user.username).substring(0, 1)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-gray-900 font-semibold text-sm">
                              {comment.user.displayName || comment.user.username}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePostComment(commentingVideoId);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-50 text-gray-900 rounded-full px-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  />
                  <Button 
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={!newComment.trim()}
                    className="text-blue-600 font-semibold disabled:text-gray-400"
                  >
                    Post
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Interaction Buttons - Right Side of the player container */}
        {allVideos.length > 0 && allVideos[activeVideoIndex] && (
          <div className={cn(
            "absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4 z-30 p-4 bg-gray-50/20 backdrop-blur-sm rounded-l-xl transition-all duration-300 ease-in-out",
            showComments ? "right-[400px]" : "right-0"
          )}>
            {/* Like */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 rounded-full" onClick={() => handleLike(allVideos[activeVideoIndex].id)}>
                <ThumbsUp size={24} />
                <span className="text-xs mt-1">{formatNumber(allVideos[activeVideoIndex]._count.likes)}</span>
            </Button>
            
            {/* Retweet - Add this button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "flex flex-col items-center h-auto p-2 text-gray-800 rounded-full",
                retweetedVideos.has(allVideos[activeVideoIndex].id) && "text-green-500"
              )}
              onClick={() => handleRetweet(allVideos[activeVideoIndex].id)}
            >
                <Repeat size={24} />
                <span className="text-xs mt-1">{formatNumber(allVideos[activeVideoIndex]._count.retweets || 0)}</span>
            </Button>

            {/* Dislike - Placeholder */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 rounded-full" onClick={() => handleDislike(allVideos[activeVideoIndex].id)}>
                <ThumbsDown size={24} />
                <span className="text-xs mt-1">Dislike</span>
            </Button>
            {/* Comment */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 rounded-full" onClick={() => handleComment(allVideos[activeVideoIndex].id)}>
                <MessageCircle size={24} />
                <span className="text-xs mt-1">{formatNumber(allVideos[activeVideoIndex]._count.comments)}</span>
            </Button>
            {/* Share */}
            <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto p-2 text-gray-800 rounded-full" onClick={() => handleShare(allVideos[activeVideoIndex].id)}>
                <Share2 size={24} />
                <span className="text-xs mt-1">Share</span>
            </Button>
            {/* More Options */}
            <Button variant="ghost" size="icon" className="h-auto p-2 text-gray-800 rounded-full">
                <MoreVertical size={24} />
            </Button>
          </div>
        )}
        
        {/* Up/Down Navigation Arrows - Centered */}
        <div className={cn(
          "absolute transform -translate-x-1/2 z-20 flex flex-col h-full justify-between py-20 pointer-events-none transition-all duration-300 ease-in-out",
          showComments ? "left-[250px]" : "left-1/2"
        )}>
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
      </div>
    </div>
  );
}