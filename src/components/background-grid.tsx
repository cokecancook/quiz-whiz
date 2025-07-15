
"use client";

import { cn } from "@/lib/utils";

interface BackgroundGridProps {
  className?: string;
}

export default function BackgroundGrid({ className }: BackgroundGridProps) {
  return (
    <div
      className={cn("absolute inset-0 z-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* Light mode background */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500 dark:opacity-0"
        style={{
          background: "hsl(var(--background))",
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.1) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 40%, transparent 80%)
          `,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%",
        }}
      />
      {/* Dark mode background */}
      <div
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 dark:opacity-100"
        style={{
          background: "hsl(var(--background))",
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.05) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 40%, transparent 80%)
          `,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%",
        }}
      />
    </div>
  );
}
