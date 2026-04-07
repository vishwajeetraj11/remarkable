import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Transfer PDFs to Your E-Ink Tablet — Remarkable Skills",
  description:
    "Step-by-step guide to transferring PDFs via USB, cloud sync, email-to-device, and third-party apps for reMarkable, Supernote, BOOX, and Kindle Scribe.",
  alternates: { canonical: "/guides/transfer-pdfs-to-tablet" },
};

export default function TransferPdfsGuide() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <Link
          href="/guides"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Guides
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          How to Transfer PDFs to Your E-Ink Tablet
        </h1>
        <p className="mt-3 text-muted-foreground">
          You&rsquo;ve generated a puzzle or template — now get it onto your
          device. This guide covers every major transfer method and the
          specifics for each popular e-ink tablet.
        </p>
      </header>

      <section className="space-y-10">
        {/* Method 1 */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            USB Transfer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The most reliable method. Connect your tablet to a computer with the
            included USB cable and drag-and-drop the PDF into the right folder.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>Works offline — no account or Wi-Fi required</li>
            <li>Fastest for batch transfers (multiple PDFs at once)</li>
            <li>
              Files appear immediately after disconnecting and refreshing
            </li>
          </ul>
        </div>

        {/* Method 2 */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Cloud Sync
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Most tablets have a companion app or cloud service that syncs files
            wirelessly. Upload a PDF from your phone or computer and it appears
            on your tablet within minutes.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>No cable needed — works from anywhere with Wi-Fi</li>
            <li>Great for on-the-go transfers from a phone</li>
            <li>Some services have storage limits on free tiers</li>
          </ul>
        </div>

        {/* Method 3 */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Email-to-Device
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Several tablets accept documents via a dedicated email address.
            Attach the PDF and send — it shows up on your device automatically.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>Convenient when sharing from apps that have a &ldquo;share via email&rdquo; option</li>
            <li>Kindle Scribe&rsquo;s Send to Kindle email is the most widely used example</li>
            <li>Check your device settings for the assigned email address</li>
          </ul>
        </div>

        {/* Method 4 */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Third-Party Apps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Tools like Calibre, KOReader, and device-specific community apps
            expand what&rsquo;s possible. They can convert formats, organize
            libraries, and push files wirelessly.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>Calibre is free, open-source, and supports virtually every e-reader</li>
            <li>Useful for managing large libraries with metadata</li>
            <li>Some tools support wireless transfer over local network</li>
          </ul>
        </div>

        {/* Device-specific sections */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Device-Specific Tips
          </h2>
        </div>

        <div>
          <h3 className="font-semibold">reMarkable</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">USB:</span> Connect
              via USB-C. The tablet appears as a storage device — drop PDFs into
              the root or any folder.
            </li>
            <li>
              <span className="font-medium text-foreground">Cloud:</span> Use
              the reMarkable desktop or mobile app. Import PDFs and they sync
              over Wi-Fi.
            </li>
            <li>
              <span className="font-medium text-foreground">Third-party:</span>{" "}
              The community-built <em>rmapi</em> tool allows command-line
              uploads.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Supernote</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">USB:</span> Connect
              via USB-C and copy to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Document</code> folder.
            </li>
            <li>
              <span className="font-medium text-foreground">Cloud:</span>{" "}
              Supernote Cloud or Dropbox integration. Upload through the
              companion app.
            </li>
            <li>
              <span className="font-medium text-foreground">Browse &amp;
              Access:</span> Use the built-in Browse &amp; Access feature via
              any web browser on the same network.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">BOOX</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">USB:</span> Mount as
              external storage and copy to any folder.
            </li>
            <li>
              <span className="font-medium text-foreground">Cloud:</span> BOOX
              Drop (push.boox.com) lets you send files from any browser on the
              same Wi-Fi network.
            </li>
            <li>
              <span className="font-medium text-foreground">Apps:</span> Since
              BOOX runs Android, you can use Google Drive, Dropbox, or any file
              manager app directly.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Kindle Scribe</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Send to
              Kindle:</span> Email the PDF to your
              Kindle&rsquo;s assigned email address (found in Amazon account
              settings).
            </li>
            <li>
              <span className="font-medium text-foreground">Send to Kindle
              app:</span> Use Amazon&rsquo;s desktop or web app to upload PDFs
              directly.
            </li>
            <li>
              <span className="font-medium text-foreground">USB:</span> Connect
              via USB and copy to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">documents</code> folder. Note: USB-transferred PDFs
              don&rsquo;t support Kindle&rsquo;s notebook overlay feature.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Ready to create something?
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate a fresh PDF and transfer it to your tablet using the method
            above.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Browse Templates
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Browse Puzzles
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
