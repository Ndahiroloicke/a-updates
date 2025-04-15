"use client"

import { useState, useEffect } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import kyInstance from "@/lib/ky"
import type { PostData } from "@/lib/types"
import { useTranslation } from "@/contexts/TranslationContext"

interface CommentInputProps {
  post?: PostData;
  postId?: string;
}

export default function CommentInput({ post, postId }: CommentInputProps) {
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()
  const id = post?.id || postId
  const { targetLanguage, translatedTexts, translateText } = useTranslation()

  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async () => {
      await kyInstance.post(`/api/posts/${id}/comments`, { json: { content } }).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] })
      setContent("")
    },
  })

  useEffect(() => {
    if (targetLanguage) {
      translateText("Write a comment...", `comment-placeholder-${id}`)
      translateText("Post Comment", `post-comment-${id}`)
      translateText("Posting...", `posting-${id}`)
    }
  }, [targetLanguage, id])

  const translatedPlaceholder = translatedTexts[`comment-placeholder-${id}`] || "Write a comment..."
  const translatedPostComment = translatedTexts[`post-comment-${id}`] || "Post Comment"
  const translatedPosting = translatedTexts[`posting-${id}`] || "Posting..."

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={translatedPlaceholder}
        className="min-h-[100px] text-foreground bg-background resize-none"
      />
      <Button
        onClick={() => submitComment()}
        disabled={!content.trim() || isPending}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {isPending ? translatedPosting : translatedPostComment}
      </Button>
    </div>
  )
}
