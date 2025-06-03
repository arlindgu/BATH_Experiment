"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MessageSquare, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface Feature {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  votes: Array<{ vote_type: number }>
  comments: Array<{ id: string }>
}

export default function MyFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadMyFeatures()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadMyFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from("feature_requests")
        .select(`
          *,
          votes (vote_type),
          comments (id)
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFeatures(data || [])
    } catch (error) {
      console.error("Error loading features:", error)
    } finally {
      setLoading(false)
    }
  }

  const getVoteCount = (votes: Array<{ vote_type: number }>) => {
    return votes.reduce((sum, vote) => sum + vote.vote_type, 0)
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Please log in to view your feature requests.</p>
            <Button onClick={() => router.push("/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Feature Requests</h1>
          <p className="text-muted-foreground">Manage your submitted feature requests</p>
        </div>
        <Button asChild>
          <Link href="/submit-feature">
            <Plus className="mr-2 h-4 w-4" />
            New Feature
          </Link>
        </Button>
      </div>

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
                    <Badge className={getStatusColor(feature.status)}>{feature.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(feature.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronUp className="h-3 w-3" />
                      {getVoteCount(feature.votes)} votes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {feature.comments.length} comments
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/features/${feature.id}`}>View Details</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}

        {features.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't submitted any feature requests yet.</p>
              <Button asChild>
                <Link href="/submit-feature">Submit your first feature request</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
