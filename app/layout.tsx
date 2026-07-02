import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Ph.D. candidate specializing in nuclear fusion, plasma physics, and scientific computing at Columbia University.";

export const metadata: Metadata = {
  title: "Daniel Burgess — Plasma Physics",
  description,
  openGraph: {
    title: "Daniel Burgess",
    description,
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Burgess",
    description,
    images: ["/og-image.jpg"],
  },
};

// Runs before first paint: skips the intro animation on repeat views in the
// same browser session (see .intro-seen rules in globals.css) and restores
// the persisted solid-background preference (see .glass-panel rules).
const introGate = `try{if(sessionStorage.getItem("intro-played"))document.documentElement.classList.add("intro-seen");else sessionStorage.setItem("intro-played","1");if(localStorage.getItem("bg-style")==="solid")document.documentElement.classList.add("bg-solid")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
