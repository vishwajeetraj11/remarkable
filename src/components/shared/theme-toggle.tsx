"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render, then `true`.
 * `useSyncExternalStore` uses its server snapshot for the initial hydration
 * render and the client snapshot thereafter, giving us a hydration-safe
 * "mounted" flag without a setState-in-effect.
 */
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Sun/moon button that flips the active theme.
 *
 * The rendered icon depends on `theme`, which is only knowable on the client
 * (the actual `.dark` class is applied by a blocking inline script). To keep
 * the server HTML and the first client render identical, we render a neutral,
 * theme-independent placeholder (a static Sun outline) until `mounted` is true.
 * After mount we swap in the real, theme-aware icon and label.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted && theme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light theme"
      : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* Until mounted, render a stable placeholder so server/client agree. */}
      {!mounted ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : isDark ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
