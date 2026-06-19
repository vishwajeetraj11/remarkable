import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { ClarityInit } from "@/components/shared/clarity";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { EmailCaptureBanner } from "@/components/shared/email-capture";
import {
  ThemeProvider,
  themeInitScript,
} from "@/components/shared/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Remarkable Skills — Free Puzzles & Templates for reMarkable",
    template: "%s | Remarkable Skills",
  },
  description:
    "Free, procedurally generated puzzles, games, templates, and activities optimized for the reMarkable paper tablet. Sudoku, crosswords, mazes, planners, and more.",
  keywords: [
    "remarkable",
    "remarkable tablet",
    "remarkable templates",
    "remarkable puzzles",
    "sudoku pdf",
    "word search pdf",
    "maze pdf",
    "free remarkable templates",
  ],
  openGraph: {
    title: "Remarkable Skills — Free reMarkable Templates",
    description:
      "Free puzzles, planners, and 51+ printable templates optimized for the reMarkable paper tablet. Generate PDFs and transfer to your device.",
    url: siteUrl,
    siteName: "Remarkable Skills",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remarkable Skills — Free reMarkable Templates",
    description:
      "Free puzzles, planners, and 51+ printable templates optimized for the reMarkable paper tablet. Generate PDFs and transfer to your device.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remarkable Skills",
    url: siteUrl,
    description:
      "Free puzzles, templates, and activities for the reMarkable tablet",
    publisher: {
      "@type": "Organization",
      name: "Remarkable Skills",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
      },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Remarkable Skills",
    url: siteUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free, procedurally generated puzzles, games, and 51+ printable templates optimized for the reMarkable paper tablet and other e-ink devices.",
    featureList: [
      "Sudoku, crossword, maze, word search, nonogram puzzle generators",
      "51+ planning, productivity, and wellness templates",
      "Kids worksheets (math, tracing, spelling, sight words)",
      "Optimized for reMarkable 2, Paper Pro, Supernote, BOOX, Kindle Scribe",
      "Client-side PDF generation — no account required",
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FeedbackWidget />
          <EmailCaptureBanner />
          <ClarityInit />
        </ThemeProvider>
      </body>
    </html>
  );
}
