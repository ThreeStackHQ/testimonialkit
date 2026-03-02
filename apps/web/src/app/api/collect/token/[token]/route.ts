import { NextRequest, NextResponse } from "next/server";
import { db, testimonialTokens, testimonials, eq } from "@testimonialkit/db";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().min(20),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // SEC-003: Rate limit by IP + token to prevent brute-force enumeration (20 req/min)
  const ip = getClientIp(req);
  const rl = rateLimit(`collect:token:${ip}:${token}`, 20, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const [tokenRecord] = await db
    .select()
    .from(testimonialTokens)
    .where(eq(testimonialTokens.token, token as any))
    .limit(1);

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (tokenRecord.usedAt) {
    return NextResponse.json({ error: "Token already used" }, { status: 409 });
  }

  if (tokenRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    // Create testimonial
    const [testimonial] = await db
      .insert(testimonials)
      .values({
        workspaceId: tokenRecord.workspaceId,
        email: tokenRecord.email,
        source: "email",
        status: "pending",
        ...parsed.data,
      })
      .returning();

    // Mark token as used
    await db
      .update(testimonialTokens)
      .set({ usedAt: new Date() })
      .where(eq(testimonialTokens.id, tokenRecord.id));

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (err) {
    console.error("[collect/token POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
