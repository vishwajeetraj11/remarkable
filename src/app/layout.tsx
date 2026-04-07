import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { ClarityInit } from "@/components/shared/clarity";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { EmailCaptureBanner } from "@/components/shared/email-capture";

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
      "Free puzzles, planners, and 40+ printable templates optimized for the reMarkable paper tablet. Generate PDFs and transfer to your device.",
    url: siteUrl,
    siteName: "Remarkable Skills",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remarkable Skills — Free reMarkable Templates",
    description:
      "Free puzzles, planners, and 40+ printable templates optimized for the reMarkable paper tablet. Generate PDFs and transfer to your device.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FeedbackWidget />
        <EmailCaptureBanner />
        <ClarityInit />
      </body>
    </html>
  );
}
