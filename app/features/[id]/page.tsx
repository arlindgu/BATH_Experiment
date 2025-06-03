import { createClient } from "@/lib/supabase/server"
import { FeatureDetail } from "@/components/feature-detail"
import { notFound } from "next/navigation"

interface FeaturePageProps {
  params: {
    id: string
  }
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const supabase = createClient()

  try {
    // Get the feature with better error handling
    const { data: feature, error: featureError } = await supabase
      .from("feature_requests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (featureError || !feature) {
      console.error("Feature not found:", featureError)
      notFound()
    }

    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", feature.user_id)
      .single()

    if (profileError) {
      console.warn("Profile not found:", profileError)
    }

    // Get votes
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("vote_type, user_id")
      .eq("feature_id", feature.id)

    if (votesError) {
      console.warn("Votes fetch error:", votesError)
    }

    // Get comments with profiles
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq("feature_id", feature.id)
      .order("created_at", { ascending: true })

    if (commentsError) {
      console.warn("Comments fetch error:", commentsError)
    }

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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Ensure we have a complete feature object
    const featureWithData = {
      ...feature,
      profiles: profile || { username: "Anonymous", full_name: null, avatar_url: null },
      votes: votes || [],
      comments: commentProfiles || [],
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <FeatureDetail feature={featureWithData} currentUser={user} />
      </div>
    )
  } catch (error) {
    console.error("Error loading feature:", error)
    notFound()
  }
}
