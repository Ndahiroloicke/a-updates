"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Story } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryViewerProps {
  story: Story;
  onNext: () => void;
  onPrevious: () => void;
  duration: number;
}

export default function StoryViewer({ story, onNext, onPrevious, duration }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);

  console.log(story.attachments?.url);
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;
      
      if (newProgress >= 100) {
        clearInterval(interval);
        onNext();
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [story.id, duration, onNext]);

  return (
    <div className="relative h-full">
      <div className="relative h-full rounded-2xl overflow-hidden">
        {/* Story Content */}
        {story.attachments?.url ? (
          <Image
            src={story.attachments.url}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No media available</p>
          </div>
        )}
        
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60">
          <h2 className="text-white text-xl font-semibold">{story.title}</h2>
          <div className="text-white/80" dangerouslySetInnerHTML={{ __html: story.description }} />
        </div>

        {/* Navigation Buttons */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2"
          onClick={onPrevious}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2"
          onClick={onNext}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}