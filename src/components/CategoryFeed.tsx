"use client"

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import Post from "@/components/posts/Post"
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton"
import kyInstance from "@/lib/ky"
import { PostsPage } from "@/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function CategoryFeed() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "category", category, subcategory],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/category",
          {
            searchParams: {
              ...(pageParam ? { cursor: pageParam } : {}),
              category,
              ...(subcategory ? { subcategory } : {})
            }
          }
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!category, // Only run query if category is available
  })

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (status === "pending") {
    return <PostsLoadingSkeleton />
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground py-10">
        No posts found in the {subcategory ? `${subcategory} section of the ` : ''}
        {category} category.
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive py-10">
        An error occurred while loading posts.
      </p>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
        {subcategory ? (
          <>
            <span className="capitalize">{subcategory}</span> in{" "}
            <span className="capitalize">{category}</span>
          </>
        ) : (
          <span className="capitalize">{category}</span>
        )}
      </h1>
      
      <InfiniteScrollContainer
        className="space-y-5"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {posts.map((post) => (
          <Post key={post.id} post={post} showContent={false} />
        ))}
        {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
      </InfiniteScrollContainer>
    </div>
  )
} 