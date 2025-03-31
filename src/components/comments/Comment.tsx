"use client"

import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Calendar, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
]

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState("")
  const [translatedTime, setTranslatedTime] = useState("")

  const handleTranslate = async (targetLang: string) => {
    setIsTranslating(true)
    try {
      // Translate content
      const contentResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: comment.content,
          targetLanguage: targetLang,
        }),
      })
      const contentData = await contentResponse.json()
      setTranslatedContent(contentData.translatedText)

      // Translate time
      const timeText = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
      const timeResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: timeText,
          targetLanguage: targetLang,
        }),
      })
      const timeData = await timeResponse.json()
      setTranslatedTime(timeData.translatedText)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const authorName = comment.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()

  return (
    <div className="py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={comment.user.avatarUrl} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">
                {authorName}
              </span>
              <span className="text-xs text-muted-foreground">
                {translatedTime || formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {translatedContent || comment.content}
            </p>
          </div>
        </div>
        {user && (
          <CommentMoreButton 
            comment={comment}
            onTranslate={handleTranslate}
            isTranslating={isTranslating}
          />
        )}
      </div>
    </div>
  )
}
