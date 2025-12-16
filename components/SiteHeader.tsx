"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-shadow group-hover:shadow-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Smart<span className="text-primary">Scrape</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Button
              asChild
              variant="ghost"
              className="rounded-full px-5 font-medium"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-border transition-shadow hover:ring-primary/50">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignUpButton>
              <Button className="rounded-full px-6 font-semibold shadow-md transition-shadow hover:shadow-lg">
                Get started
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}


