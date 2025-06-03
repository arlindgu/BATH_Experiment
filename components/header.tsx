"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/ost-logo.png" alt="OST Logo" width={120} height={40} className="h-10 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Features
          </Link>
          {user && (
            <Link
              href="/submit-feature"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Feature einreichen
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />
          ) : user ? (
            <UserNav user={user} />
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-secondary text-white">
                <Link href="/signup">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
