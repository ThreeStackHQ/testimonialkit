# TestimonialKit Security Audit

**Date:** 2026-03-02  
**Branch audited:** `feat/wren-ui-sprints`  
**Fix branch:** `feat/sage-security-audit`  
**Auditor:** Sage (Automated Security Audit — Wake Cycle 25)

---

## Summary

| ID | Title | Severity | Status |
|---|---|---|---|
| SEC-001 | No rate limiting on `POST /api/testimonials` | HIGH | ✅ FIXED |
| SEC-002 | `avatarUrl` unescaped in wall widget `<img src>` | MEDIUM | ✅ FIXED |
| SEC-003 | No rate limiting on `/api/collect/token/[token]` | LOW | ✅ FIXED |
| SEC-004 | API key comparison via DB query (timing) | LOW | ✅ ACCEPTED |

**Total checks performed:** 13  
**Passed:** 9  
**Fixed:** 3  
**Accepted (low risk):** 1

---

## Passed Checks (9/9)

- ✅ **Auth middleware coverage** — `/dashboard/:path*` fully protected via NextAuth middleware (`apps/web/src/middleware.ts`). Matcher is correctly scoped.
- ✅ **IDOR on testimonials** — All testimonial CRUD operations (`PATCH`, `DELETE`, `GET`) filter by `workspaceId` from the JWT session. Cross-workspace access correctly returns 404. Widget operations similarly scoped.
- ✅ **Stripe webhook signature** — `stripe.webhooks.constructEvent()` is used correctly. Raw body preserved via `req.text()` before any parsing. Signature header checked before processing events.
- ✅ **SQL injection via Drizzle** — All database queries use Drizzle ORM's parameterized query builder. No raw SQL template strings (`sql\`...\`` or `.execute()` with string concat) found anywhere in the codebase.
- ✅ **Widget XSS (text fields)** — `escapeHtml()` is applied to `name`, `text`, `company`, and `role` fields in `packages/widget/src/wall.ts`. `textContent` used where appropriate in `collect.ts`.
- ✅ **bcrypt password hashing** — `bcryptjs` is used for password storage and comparison in `apps/web/src/auth.ts`.
- ✅ **Zod input validation** — All API endpoints validate user-supplied input with Zod schemas before DB writes.
- ✅ **Protected API routes** — Every `/api/*` route that reads or modifies user data calls `auth()` and checks for a valid session. Public routes (`/api/testimonials/public`, widget JS) are intentionally unauthenticated.
- ✅ **No secrets in NEXT_PUBLIC_*** — Stripe keys, database URL, and auth secrets are server-side only. No sensitive values exposed to the client bundle.

---

## Detailed Findings

### SEC-001 — No Rate Limiting on `POST /api/testimonials` (**HIGH**) ✅ FIXED

**File:** `apps/web/src/app/api/testimonials/route.ts`  
**Description:** The testimonial submission endpoint accepted `X-API-Key` with no rate limiting. An attacker with a valid API key could flood the system with fake testimonials. Free-plan workspaces have a 10-testimonial cap, but paid plans (indie/pro) had no ceiling on spam submissions.

**Attack scenario:** Competitor or malicious actor obtains a workspace API key (e.g., from public source code or by creating an account) and submits thousands of fake testimonials, polluting the dashboard and exhausting storage.

**Fix:** Created `apps/web/src/lib/rate-limit.ts` — an in-memory rate limiter backed by a `Map`. Applied limit of **10 submissions/minute** per `IP + API key` combination to the `POST /api/testimonials` handler. Returns HTTP 429 with `Retry-After` and `X-RateLimit-*` headers when exceeded.

---

### SEC-002 — `avatarUrl` Not HTML-Escaped in Wall Widget (**MEDIUM**) ✅ FIXED

**File:** `packages/widget/src/wall.ts`  
**Description:** In the `cardHtml()` function, `t.avatarUrl` was interpolated directly into the HTML string as `<img src="${t.avatarUrl}" alt="${t.name}">` without escaping. While Zod's `z.string().url()` validation at the API level rejects most dangerous values, defense-in-depth requires HTML-escaping all user-controlled values before injecting them into HTML strings. A URL containing `"` characters that somehow bypassed Zod's regex could escape the attribute context.

**Fix:** Applied the existing `escapeHtml()` function (already in the file) to both the `src` and `alt` attributes of the avatar `<img>` tag:
```ts
// Before
`<img src="${t.avatarUrl}" alt="${t.name}" ...>`
// After  
`<img src="${escapeHtml(t.avatarUrl)}" alt="${escapeHtml(t.name)}" ...>`
```

---

### SEC-003 — No Rate Limiting on `/api/collect/token/[token]` (**LOW**) ✅ FIXED

**File:** `apps/web/src/app/api/collect/token/[token]/route.ts`  
**Description:** Token-based testimonial collection had no rate limiting. While tokens are UUIDs (random, 122-bit entropy making brute force computationally infeasible), the absence of rate limiting allowed for unlimited enumeration attempts and could be used as a denial-of-service vector against the database.

**Fix:** Applied rate limiter at **20 req/min per IP + token** using the shared `apps/web/src/lib/rate-limit.ts`. Returns HTTP 429 with `Retry-After` header.

---

### SEC-004 — API Key DB Comparison (Timing Side-Channel) (**LOW**) — ACCEPTED

**Description:** API key lookup is performed via a PostgreSQL equality query (`WHERE api_key = $1`) rather than a cryptographic timing-safe string comparison. This theoretically creates a timing side-channel.

**Why accepted:** The API key is a UUID v4 (122 bits of random entropy). Exploiting a timing difference between "key exists" vs "key not found" DB queries requires millions of requests across network latency, making it computationally impractical. No change made.

**Future recommendation:** Adopt HMAC-based API keys with a hashed lookup (e.g., store `hash(apiKey)` in DB, compare with `crypto.timingSafeEqual`). This eliminates the timing channel entirely.

---

## Recommendations (Future Work)

1. **Redis-backed rate limiting** — For multi-instance / serverless deployments, replace the in-memory `Map` with [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) backed by Redis Edge to share state across instances.

2. **CAPTCHA on widget collect form** — Add hCaptcha or Cloudflare Turnstile to `packages/widget/src/collect.ts` to prevent automated bot submissions that might bypass rate limiting via IP rotation.

3. **API key rotation** — Add a "Regenerate API Key" button in `/dashboard/settings` so users can rotate compromised keys without losing their workspace data.

4. **HMAC API keys** — Replace UUID-based API keys with prefixed HMAC keys (e.g., `tk_live_<base64>`) to enable timing-safe comparison and key format validation before DB lookup.

5. **Audit log** — Add an `audit_logs` table tracking testimonial status changes, bulk actions, API key usage events, and billing changes for forensic purposes.

6. **Content Security Policy** — Add CSP headers to the Next.js app to restrict inline scripts and untrusted origins, hardening the dashboard against any future XSS vectors.
