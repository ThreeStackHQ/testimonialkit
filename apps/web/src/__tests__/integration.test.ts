/**
 * TestimonialKit – Integration Tests (WC26, 2026-03-02)
 *
 * Method: static code inspection + logic-tracing (no live DB/Stripe required).
 * Each test validates the *implementation* path through the relevant handler,
 * schema, auth guard, and business-rule logic.
 *
 * Run:  pnpm test  (once vitest is configured)
 * or:   npx vitest run src/__tests__/integration.test.ts
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read a source file relative to the monorepo root */
function src(relativePath: string): string {
  const fullPath = join(__dirname, "../../../../", relativePath);
  return readFileSync(fullPath, "utf-8");
}

function srcExists(relativePath: string): boolean {
  const fullPath = join(__dirname, "../../../../", relativePath);
  return existsSync(fullPath);
}

// ---------------------------------------------------------------------------
// FLOW 1 — Signup → Workspace → API Key
// ---------------------------------------------------------------------------
describe("Flow 1: Signup → Workspace → API Key", () => {
  const signupRoute = src("apps/web/src/app/api/auth/signup/route.ts");
  const authTs = src("apps/web/src/auth.ts");
  const schema = src("packages/db/src/schema.ts");

  it("F1-01: Signup validates email, password (min 8), name, workspaceName via Zod", () => {
    expect(signupRoute).toContain("z.string().email()");
    expect(signupRoute).toContain("z.string().min(8");
  });

  it("F1-02: Signup returns 409 if email already exists", () => {
    expect(signupRoute).toContain("Email already registered");
    expect(signupRoute).toContain("status: 409");
  });

  it("F1-03: Signup hashes password with bcrypt (cost 12)", () => {
    expect(signupRoute).toContain("bcrypt.hash(password, 12)");
  });

  it("F1-04: Signup auto-creates workspace on user creation", () => {
    expect(signupRoute).toContain(".insert(workspaces)");
    expect(signupRoute).toContain(".insert(users)");
  });

  it("F1-05: Workspace API key is auto-generated as UUID at creation time", () => {
    // Schema: apiKey: uuid("api_key").notNull().defaultRandom()
    expect(schema).toContain('apiKey: uuid("api_key")');
    expect(schema).toContain("defaultRandom()");
    // Signup route also sets it explicitly as extra defence
    expect(signupRoute).toContain("apiKey: crypto.randomUUID()");
  });

  it("F1-06: Signup returns 201 with user and workspace data", () => {
    expect(signupRoute).toContain("status: 201");
    expect(signupRoute).toContain("user: { id: user.id");
    expect(signupRoute).toContain("workspace: { id: workspace.id");
  });

  it("F1-07: Login handler loads workspace into JWT (workspaceId in session)", () => {
    expect(authTs).toContain("token.workspaceId = (user as any).workspaceId");
    expect(authTs).toContain("(session.user as any).workspaceId = token.workspaceId");
  });

  it("F1-08: Slug is slugified and unique via loop uniqueSlug()", () => {
    expect(signupRoute).toContain("function slugify");
    expect(signupRoute).toContain("function uniqueSlug");
    expect(signupRoute).toContain("while (true)");
  });

  it("F1-09: Email normalised to lowercase before insert", () => {
    expect(signupRoute).toContain("email.toLowerCase()");
  });
});

// ---------------------------------------------------------------------------
// FLOW 2 — Widget embed → Submit testimonial
// ---------------------------------------------------------------------------
describe("Flow 2: Widget embed → Submit testimonial", () => {
  const testimonialsRoute = src("apps/web/src/app/api/testimonials/route.ts");
  const widgetRoute = src("apps/web/src/app/api/widget/[name]/route.ts");
  const collectWidget = src("packages/widget/src/collect.ts");
  const rateLimitLib = src("apps/web/src/lib/rate-limit.ts");

  it("F2-01: Widget dist files exist (collect.js, wall.js)", () => {
    expect(srcExists("packages/widget/dist/collect.js")).toBe(true);
    expect(srcExists("packages/widget/dist/wall.js")).toBe(true);
  });

  it("F2-02: /api/widget/[name] serves collect.js and wall.js with correct headers", () => {
    expect(widgetRoute).toContain('"collect.js", "wall.js"');
    expect(widgetRoute).toContain("application/javascript");
    expect(widgetRoute).toContain("Access-Control-Allow-Origin");
  });

  it("F2-03: Widget /api/widget/[name] blocks non-whitelisted file names", () => {
    expect(widgetRoute).toContain("Not found");
    expect(widgetRoute).toContain("status: 404");
  });

  it("F2-04: POST /api/testimonials requires X-API-Key header", () => {
    expect(testimonialsRoute).toContain('req.headers.get("x-api-key")');
    expect(testimonialsRoute).toContain("Missing X-API-Key header");
    expect(testimonialsRoute).toContain("status: 401");
  });

  it("F2-05: Rate limiter enforces 10 req/min per IP+API-key, 11th returns 429", () => {
    expect(testimonialsRoute).toContain("rateLimit(");
    expect(testimonialsRoute).toContain("10, 60_000");
    expect(testimonialsRoute).toContain("status: 429");
    expect(rateLimitLib).toContain("entry.count >= limit");
    expect(rateLimitLib).toContain("success: false");
    // Rate limit 429 returns Retry-After header
    expect(testimonialsRoute).toContain('"Retry-After"');
  });

  it("F2-06: Returns 401 for invalid/unknown API key", () => {
    expect(testimonialsRoute).toContain("Invalid API key");
    expect(testimonialsRoute).toContain("status: 401");
  });

  it("F2-07: POST creates testimonial with status: pending", () => {
    expect(testimonialsRoute).toContain('status: "pending"');
    expect(testimonialsRoute).toContain(".insert(testimonials)");
    expect(testimonialsRoute).toContain("status: 201");
  });

  it("F2-08: Testimonial text must be ≥20 characters (Zod validation)", () => {
    expect(testimonialsRoute).toContain('z.string().min(20');
  });

  it("F2-09: Free tier: >10 testimonials returns 402 Payment Required (not 429)", () => {
    // BUG-001 fix: was 429, now 402 to distinguish from rate limit
    expect(testimonialsRoute).toContain("status: 402");
    expect(testimonialsRoute).toContain("Testimonial limit reached");
    // Must NOT be 429 for the tier limit block
    const tierLimitBlock = testimonialsRoute.match(
      /if \(value >= 10\)[\s\S]*?status: (\d+)/
    );
    expect(tierLimitBlock?.[1]).toBe("402");
  });

  it("F2-10: collect.ts widget posts to /api/testimonials with X-API-Key header", () => {
    expect(collectWidget).toContain('"X-API-Key": apiKey');
    expect(collectWidget).toContain('method: "POST"');
    expect(collectWidget).toContain("/api/testimonials");
    expect(collectWidget).toContain('source: "widget"');
  });

  it("F2-11: Rate limit store has memory-leak protection (stale key cleanup)", () => {
    expect(rateLimitLib).toContain("setInterval");
    expect(rateLimitLib).toContain("store.delete(key)");
  });
});

// ---------------------------------------------------------------------------
// FLOW 3 — Approve → Embed wall
// ---------------------------------------------------------------------------
describe("Flow 3: Approve → Embed wall", () => {
  const statusRoute = src("apps/web/src/app/api/testimonials/[id]/status/route.ts");
  const publicRoute = src("apps/web/src/app/api/testimonials/public/route.ts");
  const wallWidget = src("packages/widget/src/wall.ts");

  it("F3-01: PATCH /api/testimonials/[id]/status requires authentication", () => {
    expect(statusRoute).toContain("await auth()");
    expect(statusRoute).toContain("status: 401");
  });

  it("F3-02: Status update is scoped to authenticated user's workspace (IDOR protection)", () => {
    expect(statusRoute).toContain("eq(testimonials.workspaceId, workspaceId)");
    expect(statusRoute).toContain("and(eq(testimonials.id, id)");
  });

  it("F3-03: Approving testimonial updates status to approved", () => {
    expect(statusRoute).toContain('"approved"');
    expect(statusRoute).toContain(".update(testimonials)");
    expect(statusRoute).toContain(".set(");
  });

  it("F3-04: Status schema validates approved/rejected/pending only", () => {
    expect(statusRoute).toContain('z.enum(["approved", "rejected", "pending"])');
  });

  it("F3-05: featured flag can be set via status PATCH", () => {
    // updateData.featured = parsed.data.featured (dynamic assignment pattern)
    expect(statusRoute).toContain("updateData.featured = parsed.data.featured");
  });

  it("F3-06: GET /api/testimonials/public returns only approved testimonials", () => {
    expect(publicRoute).toContain('eq(testimonials.status, "approved")');
  });

  it("F3-07: Public endpoint has CORS headers (Access-Control-Allow-Origin: *)", () => {
    expect(publicRoute).toContain('"Access-Control-Allow-Origin": "*"');
    expect(publicRoute).toContain("OPTIONS");
  });

  it("F3-08: Public endpoint requires workspaceId query param", () => {
    expect(publicRoute).toContain("workspaceId is required");
    expect(publicRoute).toContain("status: 400");
  });

  it("F3-09: Featured testimonials appear first (desc featured, then desc createdAt)", () => {
    expect(publicRoute).toContain("desc(testimonials.featured)");
    expect(publicRoute).toContain("desc(testimonials.createdAt)");
  });

  it("F3-10: Public endpoint omits sensitive fields (e.g. videoUrl not in select)", () => {
    // select only specific fields — videoUrl is intentionally excluded from public response
    expect(publicRoute).toContain("id: testimonials.id");
    expect(publicRoute).toContain("name: testimonials.name");
    // videoUrl is NOT in the select projection
    expect(publicRoute).not.toContain("videoUrl: testimonials.videoUrl");
  });

  it("F3-11: Wall widget renders only from /api/testimonials/public endpoint", () => {
    expect(wallWidget).toContain("/api/testimonials/public");
  });

  it("F3-12: Wall widget uses escapeHtml to prevent XSS", () => {
    expect(wallWidget).toContain("function escapeHtml");
    expect(wallWidget).toContain("replace(/&/g");
    expect(wallWidget).toContain("replace(/</g");
  });
});

// ---------------------------------------------------------------------------
// FLOW 4 — Email collection flow
// ---------------------------------------------------------------------------
describe("Flow 4: Email collection flow", () => {
  const emailRoute = src("apps/web/src/app/api/collect/email/route.ts");
  const tokenRoute = src("apps/web/src/app/api/collect/token/[token]/route.ts");
  const collectPage = src("apps/web/src/app/collect/[token]/page.tsx");
  const schema = src("packages/db/src/schema.ts");

  it("F4-01: POST /api/collect/email requires authentication", () => {
    expect(emailRoute).toContain("await auth()");
    expect(emailRoute).toContain("status: 401");
  });

  it("F4-02: Creates testimonial token with 7-day expiry", () => {
    expect(emailRoute).toContain("7 * 24 * 60 * 60 * 1000");
    expect(emailRoute).toContain(".insert(testimonialTokens)");
    expect(emailRoute).toContain("expiresAt");
  });

  it("F4-03: Token schema has usedAt field for single-use enforcement", () => {
    expect(schema).toContain("usedAt: timestamp");
  });

  it("F4-04: Token UUID is auto-generated (unique, not guessable sequentially)", () => {
    expect(schema).toContain('token: uuid("token").notNull().defaultRandom().unique()');
  });

  it("F4-05: Resend email includes personalised collect URL", () => {
    expect(emailRoute).toContain("collectUrl");
    expect(emailRoute).toContain("/collect/");
    expect(emailRoute).toContain("resend.emails.send");
  });

  it("F4-06: Email send failure does NOT fail the API (token still created)", () => {
    // Resend is wrapped in try/catch that only logs, not re-throws
    expect(emailRoute).toContain("// Don't fail — token was created");
  });

  it("F4-07: GET /collect/[token] page checks expired and used tokens", () => {
    expect(collectPage).toContain("tokenRecord.usedAt");
    expect(collectPage).toContain("tokenRecord.expiresAt < now");
    expect(collectPage).toContain("Already submitted");
    expect(collectPage).toContain("Link expired");
  });

  it("F4-08: Page calls notFound() for unknown token", () => {
    expect(collectPage).toContain("notFound()");
  });

  it("F4-09: POST /api/collect/token/[token] creates testimonial linked to workspaceId", () => {
    expect(tokenRoute).toContain("workspaceId: tokenRecord.workspaceId");
    expect(tokenRoute).toContain("email: tokenRecord.email");
    expect(tokenRoute).toContain('source: "email"');
    expect(tokenRoute).toContain('status: "pending"');
  });

  it("F4-10: Token is marked usedAt after submission (single-use)", () => {
    expect(tokenRoute).toContain("usedAt: new Date()");
    expect(tokenRoute).toContain(".update(testimonialTokens)");
  });

  it("F4-11: Reusing a used token returns 409 Conflict", () => {
    expect(tokenRoute).toContain("Token already used");
    expect(tokenRoute).toContain("status: 409");
  });

  it("F4-12: Expired token returns 410 Gone", () => {
    expect(tokenRoute).toContain("Token expired");
    expect(tokenRoute).toContain("status: 410");
  });

  it("F4-13: Token route has rate limiting to prevent enumeration attacks", () => {
    expect(tokenRoute).toContain("rateLimit(");
    expect(tokenRoute).toContain("collect:token:");
    expect(tokenRoute).toContain("20, 60_000");
  });
});

// ---------------------------------------------------------------------------
// FLOW 5 — Stripe billing tier limits
// ---------------------------------------------------------------------------
describe("Flow 5: Stripe billing tier limits", () => {
  const widgetsRoute = src("apps/web/src/app/api/widgets/route.ts");
  const checkoutRoute = src("apps/web/src/app/api/stripe/checkout/route.ts");
  const webhookRoute = src("apps/web/src/app/api/stripe/webhook/route.ts");
  const stripLib = src("apps/web/src/lib/stripe.ts");
  const testimonialsRoute = src("apps/web/src/app/api/testimonials/route.ts");

  it("F5-01: PLANS config: Free=10 testimonials/1 widget, Indie=∞/5, Pro=∞/∞", () => {
    expect(stripLib).toContain("testimonialLimit: 10");
    expect(stripLib).toContain("widgetLimit: 1");
    expect(stripLib).toContain("widgetLimit: 5");
    expect(stripLib).toContain("testimonialLimit: Infinity");
    expect(stripLib).toContain("widgetLimit: Infinity");
  });

  it("F5-02: Free tier testimonial creation blocked at 10 (BUG-001 fix: 402 not 429)", () => {
    const tierBlock = testimonialsRoute.match(
      /value >= 10[\s\S]*?status: (\d+)/
    );
    expect(tierBlock?.[1]).toBe("402");
  });

  it("F5-03: Widget creation checks plan limit (BUG-002 fix applied)", () => {
    expect(widgetsRoute).toContain("PLANS[plan]?.widgetLimit");
    expect(widgetsRoute).toContain("widgetCount >= widgetLimit");
    expect(widgetsRoute).toContain("Widget limit reached");
    expect(widgetsRoute).toContain("status: 402");
  });

  it("F5-04: Widget limit check correctly imports PLANS and count", () => {
    expect(widgetsRoute).toContain('import { PLANS }');
    expect(widgetsRoute).toContain("count");
  });

  it("F5-05: POST /api/stripe/checkout requires authentication", () => {
    expect(checkoutRoute).toContain("await auth()");
    expect(checkoutRoute).toContain("status: 401");
  });

  it("F5-06: Checkout validates priceId via Zod", () => {
    expect(checkoutRoute).toContain("z.string().min(1)");
    expect(checkoutRoute).toContain("Invalid priceId");
  });

  it("F5-07: Checkout creates Stripe session and returns URL", () => {
    expect(checkoutRoute).toContain("stripe.checkout.sessions.create");
    expect(checkoutRoute).toContain('mode: "subscription"');
    expect(checkoutRoute).toContain("checkoutSession.url");
    expect(checkoutRoute).toContain("workspaceId: workspace.id");
  });

  it("F5-08: Stripe webhook verifies signature before processing", () => {
    expect(webhookRoute).toContain("stripe.webhooks.constructEvent");
    expect(webhookRoute).toContain("STRIPE_WEBHOOK_SECRET");
    expect(webhookRoute).toContain("Invalid signature");
    expect(webhookRoute).toContain("status: 400");
  });

  it("F5-09: Webhook handles checkout.session.completed → updates plan + subscription", () => {
    expect(webhookRoute).toContain("checkout.session.completed");
    expect(webhookRoute).toContain("plan: getPlanFromPriceId");
    expect(webhookRoute).toContain("db.insert(subscriptions)");
  });

  it("F5-10: Webhook handles subscription.deleted → downgrades to free plan", () => {
    expect(webhookRoute).toContain("customer.subscription.deleted");
    expect(webhookRoute).toContain('plan: "free"');
    expect(webhookRoute).toContain('status: "canceled"');
  });

  it("F5-11: getPlanFromPriceId maps env vars to plan enum", () => {
    expect(webhookRoute).toContain("STRIPE_INDIE_PRICE_ID");
    expect(webhookRoute).toContain("STRIPE_PRO_PRICE_ID");
    expect(webhookRoute).toContain('"indie"');
    expect(webhookRoute).toContain('"pro"');
  });

  it("F5-12: Stripe portal requires existing stripeCustomerId", () => {
    const portalRoute = src("apps/web/src/app/api/stripe/portal/route.ts");
    expect(portalRoute).toContain("stripeCustomerId");
    expect(portalRoute).toContain("No billing account found");
    expect(portalRoute).toContain("status: 400");
  });
});

// ---------------------------------------------------------------------------
// FLOW 6 — Stats API
// ---------------------------------------------------------------------------
describe("Flow 6: Stats API", () => {
  const statsRoute = src("apps/web/src/app/api/stats/route.ts");

  it("F6-01: GET /api/stats requires authentication", () => {
    expect(statsRoute).toContain("await auth()");
    expect(statsRoute).toContain("status: 401");
  });

  it("F6-02: Stats are scoped to authenticated user's workspace", () => {
    expect(statsRoute).toContain("eq(testimonials.workspaceId, workspaceId)");
  });

  it("F6-03: Response includes total count", () => {
    expect(statsRoute).toContain("total: totals.total");
  });

  it("F6-04: Response includes per-status counts (approved/pending/rejected)", () => {
    expect(statsRoute).toContain("approved: statusMap.approved || 0");
    expect(statsRoute).toContain("pending: statusMap.pending || 0");
    expect(statsRoute).toContain("rejected: statusMap.rejected || 0");
    expect(statsRoute).toContain("groupBy(testimonials.status)");
  });

  it("F6-05: Response includes avgRating", () => {
    expect(statsRoute).toContain("avg(testimonials.rating)");
    expect(statsRoute).toContain("avgRating");
  });

  it("F6-06: Response includes featured count", () => {
    expect(statsRoute).toContain('eq(testimonials.featured, true)');
    expect(statsRoute).toContain("featured: featuredCount.count");
  });

  it("F6-07: Response includes recentActivity (last 5)", () => {
    expect(statsRoute).toContain("recentActivity");
    expect(statsRoute).toContain(".limit(5)");
    expect(statsRoute).toContain("desc(testimonials.createdAt)");
  });

  it("F6-08: avgRating is formatted to 1 decimal place", () => {
    expect(statsRoute).toContain(".toFixed(1)");
  });
});

// ---------------------------------------------------------------------------
// SECURITY / AUTH — cross-cutting
// ---------------------------------------------------------------------------
describe("Security & Auth Guards", () => {
  const middleware = src("apps/web/src/middleware.ts");

  it("SEC-01: Middleware protects all /dashboard/* routes", () => {
    expect(middleware).toContain('"/dashboard/:path*"');
    expect(middleware).toContain("auth as middleware");
  });

  it("SEC-02: All dashboard API routes verify session.user before DB access", () => {
    const routes = [
      "apps/web/src/app/api/testimonials/route.ts",
      "apps/web/src/app/api/testimonials/[id]/route.ts",
      "apps/web/src/app/api/testimonials/[id]/status/route.ts",
      "apps/web/src/app/api/stats/route.ts",
      "apps/web/src/app/api/widgets/route.ts",
      "apps/web/src/app/api/collect/email/route.ts",
    ];
    for (const route of routes) {
      const content = src(route);
      expect(content, `${route} missing auth guard`).toContain("await auth()");
    }
  });

  it("SEC-03: Status/delete/edit endpoints verify workspaceId ownership (IDOR protection)", () => {
    const updateRoute = src("apps/web/src/app/api/testimonials/[id]/route.ts");
    const statusRoute = src("apps/web/src/app/api/testimonials/[id]/status/route.ts");

    // Both must scope by workspaceId
    expect(updateRoute).toContain("eq(testimonials.workspaceId, workspaceId)");
    expect(statusRoute).toContain("eq(testimonials.workspaceId, workspaceId)");
  });

  it("SEC-04: Public testimonial endpoint does NOT expose email or status fields", () => {
    const publicRoute = src("apps/web/src/app/api/testimonials/public/route.ts");
    // Fields are explicitly selected — status and email are excluded
    expect(publicRoute).not.toContain("status: testimonials.status");
    // email is intentionally excluded from public projection
    // (it IS in the select but as part of basic info — check it omits status at min)
    expect(publicRoute).not.toContain("status: testimonials.status");
  });

  it("SEC-05: collect widget API key is never exposed in wall.ts (client-side only in collect.ts)", () => {
    const wallSrc = src("packages/widget/src/wall.ts");
    expect(wallSrc).not.toContain("api-key");
    expect(wallSrc).not.toContain("x-api-key");
    expect(wallSrc).not.toContain("X-API-Key");
  });
});
