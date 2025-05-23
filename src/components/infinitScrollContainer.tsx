"use client"

import { useRef, useCallback } from "react"

export default function InfiniteScrollContainer({ 
  children, 
  onBottomReached, 
  className 
}: {
  children: React.ReactNode;
  onBottomReached?: () => void;
  className?: string;
}) {
  const containerRef = useRef(null)

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current
      if (scrollHeight - scrollTop <= clientHeight + 20) {
        onBottomReached?.()
      }
    }
  }, [onBottomReached])

  return (
    <div ref={containerRef} onScroll={handleScroll} className={`overflow-y-auto ${className}`}>
      {children}
    </div>
  )
}

