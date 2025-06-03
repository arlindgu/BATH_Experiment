import { createClient } from "@/lib/supabase/server"
import { FeatureList } from "@/components/feature-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function FeaturesPage() {
  const supabase = createClient()

  // Simplified query - just get the basic feature data first
  const { data: features, error } = await supabase
    .from("feature_requests")
    .select("*")
    .order("created_at", { ascending: false })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Feature-Requests</h1>
          <p className="text-muted-foreground">Durchsuche und stimme über Community Feature-Requests ab</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/submit-feature">
              <Plus className="mr-2 h-4 w-4" />
              Feature einreichen
            </Link>
          </Button>
        )}
      </div>

      {/* Debug information */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Fehler:</strong> {error.message}
        </div>
      )}

      <FeatureList features={features || []} currentUser={user} />
    </div>
  )
}
