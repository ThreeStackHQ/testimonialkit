import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TestimonialKit — Collect & Embed Customer Testimonials",
  description:
    "Collect, manage and embed customer testimonials. The Testimonial.to alternative at $9/mo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
