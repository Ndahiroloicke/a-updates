"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  MessageCircle,
  Heart,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  userAvatar?: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onRepost: () => void;
  isLiked: boolean;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  username,
  description,
  likes,
  comments,
  shares,
  userAvatar,
  onLike,
  onComment,
  onShare,
  onRepost,
  isLiked,
  className,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  
  // Setup IntersectionObserver to play/pause video when in/out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          if (isPlaying && videoRef.current) {
            videoRef.current.play();
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.5 }
    );
    
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [isPlaying]);
  
  // Handle play/pause toggling
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
  
  // Handle mute toggling
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Update progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };
  
  // Handle progress bar click
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const clickPercent = clickPosition / progressBar.offsetWidth;
      const newTime = clickPercent * videoRef.current.duration;
      
      videoRef.current.currentTime = newTime;
      setProgress(clickPercent * 100);
    }
  };
  
  // Handle video end
  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Overlay controls - only show when not playing */}
      {!isPlaying && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/20"
          onClick={togglePlay}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
          >
            <Play className="w-12 h-12 text-white" />
          </motion.div>
        </button>
      )}
      
      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <div 
          className="h-1 w-full bg-gray-500/50 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div 
            className="h-full bg-white rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls row */}
        <div className="flex justify-between items-center">
          <button onClick={togglePlay} className="text-white p-1 hover:text-primary">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button onClick={toggleMute} className="text-white p-1 hover:text-primary ml-2">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <div className="flex-1" />
          
          <div className="text-xs text-white opacity-80">
            @{username}
          </div>
        </div>
      </div>
      
      {/* Right side actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4">
        <button 
          onClick={onLike}
          className={cn(
            "flex flex-col items-center text-white",
            isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("w-8 h-8", isLiked && "fill-current")} />
          <span className="text-xs mt-1">{likes}</span>
        </button>
        
        <button 
          onClick={onComment}
          className="flex flex-col items-center text-white"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="text-xs mt-1">{comments}</span>
        </button>
        
        <button 
          onClick={onShare}
          className="flex flex-col items-center text-white"
        >
          <Share2 className="w-8 h-8" />
          <span className="text-xs mt-1">{shares}</span>
        </button>
        
        <button 
          onClick={onRepost}
          className="flex flex-col items-center text-white"
        >
          <Repeat className="w-8 h-8" />
          <span className="text-xs mt-1">Repost</span>
        </button>
      </div>
      
      {/* Video info */}
      <div className="absolute left-4 bottom-24 max-w-[70%]">
        <h3 className="font-bold text-white mb-1 line-clamp-1">{title}</h3>
        <p className="text-white text-sm opacity-80 line-clamp-2">{description}</p>
      </div>
    </div>
  );
} 