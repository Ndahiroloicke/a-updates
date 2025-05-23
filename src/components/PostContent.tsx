// src/components/posts/PostContent.tsx

import React, { useEffect } from 'react';

interface PostContentProps {
  content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  useEffect(() => {
    // Load Twitter widgets
    if (window.twttr) {
      window.twttr.widgets.load();
    } else {
      // If Twitter widget script is not loaded, load it
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [content]);

  return (
    <div 
      className="post-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};