import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Games & Puzzles</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/games/sudoku" className="hover:text-foreground transition-colors">Sudoku</Link></li>
              <li><Link href="/games/word-search" className="hover:text-foreground transition-colors">Word Search</Link></li>
              <li><Link href="/games/crossword" className="hover:text-foreground transition-colors">Crossword</Link></li>
              <li><Link href="/games/maze" className="hover:text-foreground transition-colors">Maze</Link></li>
              <li><Link href="/games/nonogram" className="hover:text-foreground transition-colors">Nonogram</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Templates</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/templates/planner" className="hover:text-foreground transition-colors">Weekly Planner</Link></li>
              <li><Link href="/templates/dot-grid" className="hover:text-foreground transition-colors">Dot Grid</Link></li>
              <li><Link href="/templates/lined" className="hover:text-foreground transition-colors">Lined Paper</Link></li>
              <li><Link href="/templates/cornell" className="hover:text-foreground transition-colors">Cornell Notes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Kids</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/kids/tracing" className="hover:text-foreground transition-colors">Letter Tracing</Link></li>
              <li><Link href="/kids/math" className="hover:text-foreground transition-colors">Math Worksheets</Link></li>
              <li><Link href="/kids/coloring" className="hover:text-foreground transition-colors">Coloring Pages</Link></li>
              <li><Link href="/kids/connect-dots" className="hover:text-foreground transition-colors">Connect the Dots</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free, procedurally generated puzzles, templates, and activities optimized for the reMarkable paper tablet.
            </p>
            <p className="mt-3 text-xs text-muted-foreground/60">
              Not affiliated with reMarkable AS.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          Remarkable Skills &mdash; Free tools for your paper tablet
        </div>
      </div>
    </footer>
  );
}
