import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handset UI — messaging components for your product",
  description:
    "Open-source React components for embedded texting and calling, built on the Handset API. Copy the source with the shadcn CLI; own every pixel.",
  metadataBase: new URL("https://ui.handset.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
