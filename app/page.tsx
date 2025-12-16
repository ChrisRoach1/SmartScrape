"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      {/* Full-page gradient that flows smoothly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[800px] w-full max-w-4xl -translate-x-1/2 opacity-15" />
      </div>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Scrape smarter,{" "}
            <span className="text-primary">not harder</span>
          </h1>

          {/* Subhead */}
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Extract the data you need from any website in seconds. No code, no
            hassle — just results.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="rounded-full px-8 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
                >
                  Get started free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Lightning fast"
            description="Get your data in seconds with our optimized scraping engine."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Reliable & safe"
            description="Built-in retry logic and respectful rate limiting keep you in the clear."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
            title="Structured output"
            description="Export clean JSON or CSV ready for your pipeline or spreadsheet."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
        {icon}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
