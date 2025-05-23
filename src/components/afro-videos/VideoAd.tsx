import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoAdProps {
  imageSrc: string;
  link: string;
  alt: string;
  onClose?: () => void;
}

export default function VideoAd({ imageSrc, link, alt, onClose }: VideoAdProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      <Link 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Ad Image */}
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-contain"
        />
        
        {/* Ad Label */}
        <div className="absolute top-4 right-4 bg-black/30 text-white text-sm px-2 py-1 rounded">
          Ad
        </div>
      </Link>

      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
        >
          <X size={20} />
        </Button>
      )}
    </div>
  );
} 