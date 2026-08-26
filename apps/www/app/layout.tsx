import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handset UI — a business phone system as React components",
  description:
    "Open-source React components for embedded texting, calling, voicemail, number porting, and 10DLC compliance, built on the Handset API. Copy the source with the shadcn CLI; own every pixel.",
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
