import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Vote, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, Calendar, User } from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()

  // Fetch top 3 most recent feature requests
  const { data: featuredRequests } = await supabase
    .from("feature_requests")
    .select(`
      *,
      profiles:user_id (username, full_name),
      votes (vote_type)
    `)
    .order("created_at", { ascending: false })
    .limit(3)
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Image src="/images/ost-logo.png" alt="OST Logo" width={200} height={67} className="h-auto w-auto" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Gestalte die Zukunft mit <span className="text-primary">OST-Vote</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Reiche Feature-Requests ein, stimme über Ideen ab und hilf dabei zu priorisieren, was als nächstes entwickelt
          wird. Deine Stimme zählt in der Produktentwicklung.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white">
            <Link href="/features">
              Features durchsuchen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Link href="/signup">Loslegen</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="border-gray-200">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-foreground">Community-getrieben</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tritt einer Community von Benutzern bei, die aktiv an der Gestaltung von Produktfeatures teilnehmen
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <Vote className="h-8 w-8 text-secondary mb-2" />
            <CardTitle className="text-foreground">Demokratisches Abstimmen</CardTitle>
            <CardDescription className="text-muted-foreground">
              Stimme für Features, die du willst und gegen solche, die du nicht willst. Jede Stimme zählt.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-tertiary mb-2" />
            <CardTitle className="text-foreground">Offene Diskussion</CardTitle>
            <CardDescription className="text-muted-foreground">
              Diskutiere Feature-Ideen, gib Feedback und arbeite mit anderen Benutzern zusammen
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Featured Requests Section */}
      {featuredRequests && featuredRequests.length > 0 && (
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Neueste Feature-Requests</h2>
            <p className="text-muted-foreground">Schau dir an, was die Community fordert</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredRequests.map((feature) => {
              const voteCount = feature.votes.reduce((sum: number, vote: any) => sum + vote.vote_type, 0)
              return (
                <Card key={feature.id} className="hover:shadow-md transition-shadow border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-1">
                            <Link
                              href={`/features/${feature.id}`}
                              className="text-foreground hover:text-primary transition-colors"
                            >
                              {feature.title}
                            </Link>
                          </CardTitle>
                          <Badge variant="secondary" className="bg-secondary text-white">
                            {feature.status === "pending"
                              ? "ausstehend"
                              : feature.status === "in-progress"
                                ? "in Bearbeitung"
                                : feature.status === "completed"
                                  ? "abgeschlossen"
                                  : feature.status === "rejected"
                                    ? "abgelehnt"
                                    : feature.status}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 text-muted-foreground">
                          {feature.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {feature.profiles?.full_name || feature.profiles?.username || "Anonym"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(feature.created_at).toLocaleDateString("de-CH")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <ChevronUp className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{voteCount}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/features">Alle Features anzeigen</Link>
            </Button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center bg-muted rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4 text-foreground">Bereit loszulegen?</h2>
        <p className="text-muted-foreground mb-6">
          Tritt tausenden von Benutzern bei, die bereits die Zukunft von Produkten gestalten
        </p>
        <Button size="lg" asChild className="bg-primary hover:bg-secondary text-white">
          <Link href="/signup">Konto erstellen</Link>
        </Button>
      </div>
    </div>
  )
}
