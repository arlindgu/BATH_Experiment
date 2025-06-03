export default function AuthCodeErrorPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn't log you in. Please try again.</p>
        <a href="/login" className="text-primary hover:underline">
          Back to Login
        </a>
      </div>
    </div>
  )
}
