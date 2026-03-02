import Link from "next/link";
import { Star, CheckCircle2, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TestimonialKit — Collect & Embed Testimonials at $9/mo",
  description:
    "Collect, manage, and embed customer testimonials with one line of code. The Testimonial.to alternative at 1/3rd the price.",
  openGraph: {
    title: "TestimonialKit — Collect & Embed Testimonials",
    description: "Testimonial collection and embedding at $9/mo. Testimonial.to alternative.",
    url: "https://testimonialkit.threestack.io",
    siteName: "TestimonialKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TestimonialKit — Collect & Embed Testimonials",
    description: "The Testimonial.to alternative at 1/3rd the price.",
  },
};

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-teal-400" fill="#0d9488" />
      ))}
    </div>
  );
}

const features = [
  {
    emoji: "🧩",
    title: "Collection Widget",
    desc: "Drop one script tag on your site. Visitors can submit text (or video!) testimonials in seconds.",
  },
  {
    emoji: "🖼️",
    title: "Wall of Love",
    desc: "Embed a beautiful, auto-updating grid of your best testimonials anywhere on your site.",
  },
  {
    emoji: "📧",
    title: "Email Ask",
    desc: "Send personalized collection emails to past customers and collect testimonials via a magic link.",
  },
];

const steps = [
  { n: "1", title: "Install the widget", desc: "Add one script tag to your site. No framework required." },
  { n: "2", title: "Collect testimonials", desc: "Customers submit reviews via widget, email link, or you add them manually." },
  { n: "3", title: "Embed your Wall", desc: "Approve the best ones and embed your Wall of Love with another script tag." },
];

const fakeTestimonials = [
  {
    name: "Sara Chen",
    role: "Founder, LaunchFast",
    text: "We went from zero social proof to 40+ testimonials in a week. The widget just works. I switched from Testimonial.to and saved $480/year.",
    rating: 5,
  },
  {
    name: "Marcus Webb",
    role: "Indie Hacker",
    text: "Set it up in 10 minutes. The embed code is clean and my conversion rate jumped 18% when I added the Wall of Love to my landing page.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Product Lead, ShipIt",
    text: "Finally a tool that doesn't charge per seat or per testimonial. $9/mo flat is exactly what solo builders need.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    desc: "For experimenting",
    features: ["10 testimonials", "1 widget", "Basic embed", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Indie",
    price: "$9",
    desc: "For indie makers & small teams",
    features: [
      "Unlimited testimonials",
      "Unlimited widgets",
      "Wall + Slider + Card",
      "Email collection",
      "Priority support",
      "Video testimonials",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$19",
    desc: "For growing businesses",
    features: [
      "Everything in Indie",
      "5 team members",
      "Custom domain widget",
      "White-label embed",
      "API access",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

const comparison = [
  { feature: "Pricing", tk: "$9/mo", testimonialTo: "$49/mo", senja: "$49/mo" },
  { feature: "Testimonials", tk: "Unlimited", testimonialTo: "Unlimited", senja: "Unlimited" },
  { feature: "Collection Widget", tk: "✓", testimonialTo: "✓", senja: "✓" },
  { feature: "Wall of Love Embed", tk: "✓", testimonialTo: "✓", senja: "✓" },
  { feature: "Video Testimonials", tk: "✓", testimonialTo: "✓", senja: "✓" },
  { feature: "Email Collection", tk: "✓", testimonialTo: "✓", senja: "✓" },
  { feature: "API Access", tk: "Pro only", testimonialTo: "Paid", senja: "Paid" },
  { feature: "White-label", tk: "Pro only", testimonialTo: "Enterprise", senja: "Enterprise" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-400" fill="#0d9488" />
            <span className="font-bold text-lg" style={{ color: "#0d9488" }}>TestimonialKit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
              style={{ background: "#0d9488" }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border border-teal-500/30"
              style={{ background: "rgba(13,148,136,0.1)", color: "#0d9488" }}
            >
              🎉 1/3rd the price of Testimonial.to
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Collect testimonials{" "}
              <span style={{ color: "#0d9488" }}>in 1 click</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Add a collection widget, gather social proof, and embed a beautiful Wall of Love —
              all for{" "}
              <strong className="text-white">$9/mo</strong> instead of Testimonial.to's $49.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl font-semibold text-white transition-colors"
                style={{ background: "#0d9488" }}
              >
                Start for free →
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3 rounded-xl font-semibold text-slate-300 border border-white/20 hover:border-white/40 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Browser mockup — Wall of Love */}
          <div
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "#1e293b" }}
          >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10" style={{ background: "#0f172a" }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-teal-400/60" />
              <span className="text-xs text-slate-400 ml-2">testimonialkit.io/wall-of-love</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { name: "Alex M.", text: "Best purchase decision this year!", rating: 5 },
                { name: "Sarah K.", text: "Saved us hours every week.", rating: 5 },
                { name: "Tom R.", text: "Simple and it just works.", rating: 5 },
                { name: "Jess L.", text: "Customer support is amazing!", rating: 5 },
              ].map((t, i) => (
                <div key={i} className="rounded-xl p-3 border border-white/10" style={{ background: "#0f172a" }}>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3 h-3 text-teal-400" fill="#0d9488" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 mb-2">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-medium text-slate-400">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/10 py-5" style={{ background: "#0f172a" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
          <span>⭐ Trusted by <strong className="text-white">500+ indie makers</strong></span>
          <span>🚀 <strong className="text-white">2 min</strong> setup time</span>
          <span>💸 Save <strong className="text-white">$480/yr</strong> vs Testimonial.to</span>
          <span>🔒 No credit card required to start</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need to collect social proof</h2>
          <p className="text-slate-400 text-lg">Three powerful tools, one affordable plan.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-6 border border-white/10"
              style={{ background: "#0f172a" }}
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-y border-white/10" style={{ background: "#0f172a" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Up and running in 3 steps</h2>
            <p className="text-slate-400 text-lg">No developer required. Really.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-extrabold mx-auto mb-5"
                  style={{ background: "rgba(13,148,136,0.2)", color: "#0d9488" }}
                >
                  {n}
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
          {/* Code snippet */}
          <div className="mt-12 max-w-xl mx-auto rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10" style={{ background: "#020617" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400/60" />
            </div>
            <div className="p-4 font-mono text-sm" style={{ background: "#020617" }}>
              <span className="text-slate-500">{"<!-- Add to your site -->"}</span>
              <br />
              <span className="text-teal-400">{"<script"}</span>
              <br />
              <span className="text-blue-300 pl-4">{"  src"}</span>
              <span className="text-white">{"="}</span>
              <span className="text-amber-300">{"\"https://app.testimonialkit.io/widget.js\""}</span>
              <br />
              <span className="text-blue-300 pl-4">{"  data-api-key"}</span>
              <span className="text-white">{"="}</span>
              <span className="text-amber-300">{"\"your-key\""}</span>
              <br />
              <span className="text-teal-400">{">"}</span>
              <span className="text-teal-400">{"</script>"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400 text-lg">No per-seat fees. No testimonial limits on paid plans. No surprises.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {pricingPlans.map(({ name, price, desc, features, cta, highlighted }) => (
            <div
              key={name}
              className={`rounded-2xl p-6 border ${
                highlighted
                  ? "border-teal-500 shadow-[0_0_40px_rgba(13,148,136,0.2)]"
                  : "border-white/10"
              }`}
              style={{ background: highlighted ? "rgba(13,148,136,0.05)" : "#0f172a" }}
            >
              {highlighted && (
                <div
                  className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3"
                  style={{ background: "#0d9488", color: "#fff" }}
                >
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{name}</h3>
              <p className="text-slate-400 text-sm mb-4">{desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">{price}</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <Link
                href="/signup"
                className={`block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors mb-6 ${
                  highlighted
                    ? "text-white"
                    : "text-slate-300 border border-white/20 hover:border-white/40"
                }`}
                style={highlighted ? { background: "#0d9488" } : {}}
              >
                {cta}
              </Link>
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <h3 className="text-2xl font-bold text-center mb-6">How we compare</h3>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#0f172a" }}>
                <th className="px-5 py-4 text-left text-slate-400 font-medium">Feature</th>
                <th className="px-5 py-4 text-center font-bold" style={{ color: "#0d9488" }}>TestimonialKit</th>
                <th className="px-5 py-4 text-center text-slate-400 font-medium">Testimonial.to</th>
                <th className="px-5 py-4 text-center text-slate-400 font-medium">Senja</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(({ feature, tk, testimonialTo, senja }, i) => (
                <tr
                  key={feature}
                  className={i % 2 === 0 ? "" : ""}
                  style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
                >
                  <td className="px-5 py-3.5 text-slate-300 border-t border-white/5">{feature}</td>
                  <td className="px-5 py-3.5 text-center font-semibold border-t border-white/5" style={{ color: "#0d9488" }}>{tk}</td>
                  <td className="px-5 py-3.5 text-center text-slate-400 border-t border-white/5">{testimonialTo}</td>
                  <td className="px-5 py-3.5 text-center text-slate-400 border-t border-white/5">{senja}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-y border-white/10" style={{ background: "#0f172a" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Loved by indie makers</h2>
          <p className="text-slate-400 text-center mb-12">Real testimonials from real customers.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {fakeTestimonials.map(({ name, role, text, rating }) => (
              <div
                key={name}
                className="rounded-2xl p-6 border border-white/10"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <StarRow count={rating} />
                <p className="text-slate-300 mt-4 mb-5 leading-relaxed">&ldquo;{text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{name}</div>
                  <div className="text-sm text-slate-400">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div
          className="rounded-3xl p-12 border border-teal-500/30"
          style={{ background: "rgba(13,148,136,0.08)" }}
        >
          <h2 className="text-4xl font-extrabold mb-4">
            Start collecting testimonials today
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Free plan forever. Upgrade when you're ready. No credit card needed to get started.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg transition-colors"
            style={{ background: "#0d9488" }}
          >
            Get started for free →
          </Link>
          <p className="text-slate-500 text-sm mt-4">Setup in 2 minutes · No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12" style={{ background: "#0f172a" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-teal-400" fill="#0d9488" />
            <span className="font-bold" style={{ color: "#0d9488" }}>TestimonialKit</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <p className="text-slate-500 text-sm">© 2026 TestimonialKit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
