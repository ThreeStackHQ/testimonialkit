import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="font-bold text-xl text-gray-900">TestimonialKit</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">Sign in</Link>
          <Link href="/signup" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-brand px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <span>🎉</span> Testimonial.to alternative at 80% less cost
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Collect testimonials<br />
          <span className="text-brand">in minutes, not hours</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Embed a collection widget on any site, build a Wall of Love, collect via email — all for $9/mo vs Testimonial.to&apos;s $50/mo.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-brand text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-dark transition-colors shadow-lg shadow-teal-200">
            Start for free →
          </Link>
          <span className="text-gray-500 text-sm">No credit card required</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: "⭐", title: "Collection Widget", desc: "Embed a floating 'Leave a Review' button on any website. Pure JS, no dependencies." },
          { icon: "🧱", title: "Wall of Love", desc: "Display approved testimonials as a beautiful masonry grid, slider, or card." },
          { icon: "📧", title: "Email Collection", desc: "Send personalized email links. Customers fill in a form, you get testimonials." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Simple, honest pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Free", price: "$0", features: ["10 testimonials", "1 widget", "Collection widget"] },
            { name: "Indie", price: "$9/mo", features: ["Unlimited testimonials", "5 widgets", "Email collection", "Wall of Love"], highlight: true },
            { name: "Pro", price: "$19/mo", features: ["Everything in Indie", "Unlimited widgets", "Team access", "Priority support"] },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? "bg-brand text-white border-brand shadow-lg shadow-teal-200" : "bg-white border-gray-200"}`}>
              <div className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</div>
              <div className={`text-3xl font-extrabold mb-4 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-teal-50" : "text-gray-600"}`}>
                    <span>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${plan.highlight ? "bg-white text-brand hover:bg-teal-50" : "bg-brand text-white hover:bg-brand-dark"}`}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
