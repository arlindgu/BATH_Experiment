import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Feature Not Found</h1>
      <p className="text-muted-foreground mb-6">The feature request you're looking for doesn't exist.</p>
      <Button asChild>
        <Link href="/features">Back to Features</Link>
      </Button>
    </div>
  )
}
