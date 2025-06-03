"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronUp, ChevronDown, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CommentSection } from "./comment-section"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface FeatureDetailProps {
  feature: any
  currentUser: SupabaseUser | null
}

export function FeatureDetail({ feature: initialFeature, currentUser }: FeatureDetailProps) {
  const [feature, setFeature] = useState(initialFeature)
  const { toast } = useToast()
  const supabase = createClient()

  // Add null check for feature
  if (!feature) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Feature not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getVoteCount = () => {
    if (!feature.votes || !Array.isArray(feature.votes)) return 0
    return feature.votes.reduce((sum: number, vote: any) => sum + vote.vote_type, 0)
  }

  const getUserVote = () => {
    if (!currentUser || !feature.votes || !Array.isArray(feature.votes)) return null
    return feature.votes.find((vote: any) => vote.user_id === currentUser.id)?.vote_type || null
  }

  const handleVote = async (voteType: number) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on features.",
        variant: "destructive",
      })
      return
    }

    try {
      const existingVote = getUserVote()

      if (existingVote === voteType) {
        // Remove vote
        await supabase.from("votes").delete().eq("feature_id", feature.id).eq("user_id", currentUser.id)
      } else if (existingVote) {
        // Update vote
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("feature_id", feature.id)
          .eq("user_id", currentUser.id)
      } else {
        // Create new vote
        await supabase.from("votes").insert({
          feature_id: feature.id,
          user_id: currentUser.id,
          vote_type: voteType,
        })
      }

      // Refresh feature data
      const { data: updatedFeature } = await supabase.from("feature_requests").select("*").eq("id", feature.id).single()

      if (updatedFeature) {
        // Get updated votes
        const { data: votes } = await supabase.from("votes").select("vote_type, user_id").eq("feature_id", feature.id)

        // Get updated comments
        const { data: comments } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            created_at,
            user_id
          `)
          .eq("feature_id", feature.id)
          .order("created_at", { ascending: true })

        // Get profiles for comments
        const commentProfiles =
          comments && comments.length > 0
            ? await Promise.all(
                comments.map(async (comment) => {
                  const { data: commentProfile } = await supabase
                    .from("profiles")
                    .select("username, full_name, avatar_url")
                    .eq("id", comment.user_id)
                    .single()
                  return {
                    ...comment,
                    profiles: commentProfile || { username: "Anonymous", full_name: null, avatar_url: null },
                  }
                }),
              )
            : []

        setFeature({
          ...updatedFeature,
          profiles: feature.profiles, // Keep existing profile data
          votes: votes || [],
          comments: commentProfiles || [],
        })
      }

      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const userVote = getUserVote()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <Badge className={getStatusColor(feature.status)}>{feature.status}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={feature.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{feature.profiles?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                  </Avatar>
                  <span>{feature.profiles?.full_name || feature.profiles?.username || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(feature.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 ml-6">
              <Button
                variant={userVote === 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote(1)}
                className="h-10 w-10 p-0"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold">{getVoteCount()}</span>
              <Button
                variant={userVote === -1 ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote(-1)}
                className="h-10 w-10 p-0"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{feature.description}</p>
          </div>
        </CardContent>
      </Card>

      <CommentSection featureId={feature.id} comments={feature.comments || []} currentUser={currentUser} />
    </div>
  )
}
