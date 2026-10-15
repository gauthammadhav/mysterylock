import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mystery Learning — Meaningful, Curriculum-Grounded Assignments",
  description:
    "Transform syllabus materials into curriculum-grounded case files. Students investigate clues, defend hypotheses with evidence, and demonstrate real understanding — powered by RAG and transparent 100-point rubrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-[#FAFBF8] text-[#202722] antialiased selection:bg-[#DCEBDD] selection:text-[#153D2E]">
        {children}
      </body>
    </html>
  );
}
