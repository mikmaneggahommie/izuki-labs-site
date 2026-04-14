import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="section-shell flex min-h-screen items-center">
      <div className="content-shell grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.55fr)] lg:items-end">
        <div className="space-y-8">
          <div className="section-label-row">
            <span className="accent-square accent-square--tiny" aria-hidden />
            <span className="section-label">izuki.labs</span>
          </div>

          <h1 className="display-title max-w-[10ch]">
            Social media systems for brands that need visual distinction
            <span className="accent-square" aria-hidden />
          </h1>
        </div>

        <div className="space-y-8 lg:justify-self-end lg:text-right">
          <p className="body-copy max-w-xl lg:ml-auto">
            The full package site lives one click away. Inside, you&apos;ll find
            the editorial redesign, fixed monthly retainers, highlighted case
            studies, and a direct path to start a project.
          </p>

          <Link
            href="/SocialmediaPackage"
            className="primary-button inline-flex w-fit lg:ml-auto"
          >
            Enter The Package Site
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
