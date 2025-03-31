"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import kyInstance from "@/lib/ky"
import type { PostData } from "@/lib/types"

export default function CommentInput({ post }: { post: PostData }) {
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()

  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async () => {
      await kyInstance.post(`/api/posts/${post.id}/comments`, { json: { content } }).json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] })
      setContent("")
    },
  })

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[100px] text-foreground bg-background resize-none"
      />
      <Button
        onClick={() => submitComment()}
        disabled={!content.trim() || isPending}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {isPending ? "Posting..." : "Post Comment"}
      </Button>
    </div>
  )
}
