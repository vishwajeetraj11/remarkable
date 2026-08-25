"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const MOBILE_NAV_ID = "mobile-primary-navigation";

export function MobileNavToggle({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      toggleRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="inline-flex size-11 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 xl:hidden"
        aria-label={open ? "Close main menu" : "Open main menu"}
        aria-controls={MOBILE_NAV_ID}
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          ref={navRef}
          id={MOBILE_NAV_ID}
          className="absolute left-0 right-0 top-full border-t border-border bg-background px-4 pb-4 xl:hidden"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <div key={item.href} className="py-2">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
            <ThemeToggle className="-ml-2" />
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
          </div>
        </nav>
      )}
    </>
  );
}
