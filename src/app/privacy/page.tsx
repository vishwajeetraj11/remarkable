import type { Metadata } from "next";
import { ManageConsent } from "@/components/shared/manage-consent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Remarkable Skills handles your data: client-side PDF generation, local storage, Microsoft Clarity analytics, and the consent-gated Google Ads tag.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "July 21, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-8 text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <section className="space-y-3">
          <h2>The short version</h2>
          <p>
            Remarkable Skills is a free tool site. There are no accounts, and
            every PDF is generated entirely in your browser — the puzzles and
            templates you create are never uploaded anywhere. We use one
            analytics tool (Microsoft Clarity) and, only if you accept the
            cookie banner, one advertising measurement tag (Google Ads).
          </p>
        </section>

        <section className="space-y-3">
          <h2>PDF generation happens on your device</h2>
          <p>
            All generators run client-side. The content of the PDFs you create
            (custom titles, word lists, dates, settings) stays in your browser
            and is not transmitted to us or any third party.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Data stored in your browser (localStorage)</h2>
          <p>
            We keep a few values in your browser&apos;s localStorage. These
            never leave your device:
          </p>
          <ul>
            <li>a count of how many PDFs you have downloaded</li>
            <li>
              whether you dismissed or submitted the email sign-up banner (and
              the email you entered, stored locally)
            </li>
            <li>your theme preference (light/dark)</li>
            <li>your cookie-consent choice</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Analytics — Microsoft Clarity</h2>
          <p>
            We use Microsoft Clarity to understand how visitors use the site
            (pages visited, clicks, scrolling). Clarity may use cookies and
            collects usage data as described in{" "}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              className="underline hover:text-foreground"
              rel="noopener noreferrer"
              target="_blank"
            >
              Microsoft&apos;s privacy statement
            </a>
            . We use this only to improve the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Advertising measurement — Google Ads tag (consent-gated)</h2>
          <p>
            We run ads on Google and use the Google Ads tag (gtag.js) to
            measure whether those ads lead to actual use of the site. The tag:
          </p>
          <ul>
            <li>
              loads <strong>only after you click “Accept”</strong> on the
              cookie banner — declining keeps it fully off
            </li>
            <li>
              sets Google advertising cookies and sends Google a page-visit
              event and a conversion event when you generate a PDF
            </li>
            <li>
              is operated by Google as described in the{" "}
              <a
                href="https://policies.google.com/privacy"
                className="underline hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google privacy policy
              </a>
            </li>
          </ul>
          <p>
            We do not send Google your name, email, or the content of any PDF
            you generate.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Manage your consent</h2>
          <p>
            You can change your cookie choice at any time. Resetting brings the
            consent banner back so you can decide again.
          </p>
          <ManageConsent />
        </section>

        <section className="space-y-3">
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a
              href="mailto:vishwajeetraj11@gmail.com"
              className="underline hover:text-foreground"
            >
              vishwajeetraj11@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
