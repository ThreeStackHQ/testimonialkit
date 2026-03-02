import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://testimonialkit.threestack.io"),
  title: {
    default: "TestimonialKit — Collect & Embed Customer Testimonials",
    template: "%s | TestimonialKit",
  },
  description:
    "Collect, manage and embed customer testimonials. The Testimonial.to alternative at $9/mo.",
  openGraph: {
    title: "TestimonialKit — Collect & Embed Customer Testimonials",
    description:
      "Collect, manage and embed customer testimonials. The Testimonial.to alternative at $9/mo.",
    url: "https://testimonialkit.threestack.io",
    siteName: "TestimonialKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TestimonialKit — Collect & Embed Customer Testimonials",
    description:
      "Collect, manage and embed customer testimonials. The Testimonial.to alternative at $9/mo.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
