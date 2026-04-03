import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Ops Automation",
  description: "Automate your IT operations with visual workflows",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
