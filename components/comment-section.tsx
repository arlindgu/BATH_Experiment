"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  featureId: string
  comments: Comment[]
  currentUser: SupabaseUser | null
}

export function CommentSection({ featureId, comments: initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          feature_id: featureId,
          user_id: currentUser.id,
          content: newComment.trim(),
        })
        .select()
        .single()

      if (error) throw error

      // Fetch the profile data separately
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", currentUser.id)
        .single()

      // Create the comment object with profile data
      const commentWithProfile = {
        ...data,
        profiles: profile || {
          username: "Anonymous",
          full_name: null,
          avatar_url: null,
        },
      }

      setComments([...comments, commentWithProfile])
      setNewComment("")

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this feature request..."
              rows={3}
            />
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? "Adding Comment..." : "Add Comment"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">Please log in to join the discussion.</div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.profiles.full_name || comment.profiles.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
