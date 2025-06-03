"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, MessageSquare, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Feature {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  user_id: string
}

interface FeatureWithData extends Feature {
  profile?: {
    username: string
    full_name: string | null
  }
  votes: Array<{ vote_type: number }>
  voteCount: number
}

interface FeatureListProps {
  features: Feature[]
  currentUser: SupabaseUser | null
}

export function FeatureList({ features: initialFeatures, currentUser }: FeatureListProps) {
  const [features, setFeatures] = useState<FeatureWithData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Load additional data for features
  useEffect(() => {
    const loadFeatureData = async () => {
      const featuresWithData = await Promise.all(
        initialFeatures.map(async (feature) => {
          // Get profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name")
            .eq("id", feature.user_id)
            .single()

          // Get votes
          const { data: votes } = await supabase.from("votes").select("vote_type").eq("feature_id", feature.id)

          const voteCount = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0

          return {
            ...feature,
            profile: profile || undefined,
            votes: votes || [],
            voteCount,
          }
        }),
      )

      setFeatures(featuresWithData)
      setLoading(false)
    }

    if (initialFeatures.length > 0) {
      loadFeatureData()
    } else {
      setLoading(false)
    }
  }, [initialFeatures, supabase])

  const handleVote = async (featureId: string, voteType: number) => {
    if (!currentUser) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melde dich an, um über Features abzustimmen.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("feature_id", featureId)
        .eq("user_id", currentUser.id)
        .single()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking same button
          await supabase.from("votes").delete().eq("id", existingVote.id)
        } else {
          // Update vote type
          await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)
        }
      } else {
        // Create new vote
        await supabase.from("votes").insert({
          feature_id: featureId,
          user_id: currentUser.id,
          vote_type: voteType,
        })
      }

      // Refresh the specific feature's vote count
      const { data: votes } = await supabase.from("votes").select("vote_type").eq("feature_id", featureId)

      const voteCount = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0

      setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, votes: votes || [], voteCount } : f)))

      toast({
        title: "Stimme erfasst",
        description: "Deine Stimme wurde erfolgreich erfasst.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "ausstehend"
      case "in-progress":
        return "in Bearbeitung"
      case "completed":
        return "abgeschlossen"
      case "rejected":
        return "abgelehnt"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {initialFeatures.map((feature) => (
          <Card key={feature.id} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <Card key={feature.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">
                    <Link href={`/features/${feature.id}`} className="hover:text-primary transition-colors">
                      {feature.title}
                    </Link>
                  </CardTitle>
                  <Badge className={getStatusColor(feature.status)}>{getStatusText(feature.status)}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {feature.profile?.full_name || feature.profile?.username || "Anonym"}
                  </div>
                  <div>{new Date(feature.created_at).toLocaleDateString("de-CH")}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={() => handleVote(feature.id, 1)} className="h-8 w-8 p-0">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{feature.voteCount}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleVote(feature.id, -1)} className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/features/${feature.id}`}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Diskutieren
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}

      {features.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Keine Feature-Requests gefunden.</p>
            {currentUser && (
              <Button className="mt-4" asChild>
                <Link href="/submit-feature">Den ersten Feature-Request einreichen</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
