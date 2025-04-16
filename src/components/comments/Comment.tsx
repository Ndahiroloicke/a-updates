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
import { useTranslation } from "@/contexts/TranslationContext";
import { useEffect } from "react";

interface CommentProps {
  comment: CommentData;
}

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'am', name: 'Amharic' },
]

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();
  const { targetLanguage, translatedTexts, translateText } = useTranslation();

  const authorName = comment.user.displayName || "Anonymous"
  const avatarFallback = authorName.charAt(0).toUpperCase()

  useEffect(() => {
    if (targetLanguage) {
      // Translate comment content and time
      translateText(comment.content, `comment-${comment.id}`);
      const timeText = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
      translateText(timeText, `comment-time-${comment.id}`);
    }
  }, [targetLanguage, comment.id, comment.content, comment.createdAt]);

  const translatedContent = translatedTexts[`comment-${comment.id}`] || comment.content;
  const translatedTime = translatedTexts[`comment-time-${comment.id}`] || 
    formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

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
                {translatedTime}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {translatedContent}
            </p>
          </div>
        </div>
        {user && (
          <CommentMoreButton 
            comment={comment}
            className="text-muted-foreground hover:text-foreground"
          />
        )}
      </div>
    </div>
  )
}
