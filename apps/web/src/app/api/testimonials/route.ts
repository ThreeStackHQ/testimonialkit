import { NextRequest, NextResponse } from "next/server";
import {
  db,
  testimonials,
  workspaces,
  eq,
  and,
  desc,
  count,
} from "@testimonialkit/db";
import { auth } from "@/auth";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().min(20, "Message must be at least 20 characters"),
  videoUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  source: z.enum(["widget", "email", "manual"]).default("widget"),
});

// POST — public, requires X-API-Key header
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing X-API-Key header" }, { status: 401 });
  }

  // SEC-001: Rate limit by IP + API key (10 submissions/minute)
  const ip = getClientIp(req);
  const rl = rateLimit(`testimonials:${ip}:${apiKey}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Find workspace by apiKey
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.apiKey, apiKey as any))
    .limit(1);

  if (!workspace) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Tier limit check for free plan
  if (workspace.plan === "free") {
    const [{ value }] = await db
      .select({ value: count() })
      .from(testimonials)
      .where(eq(testimonials.workspaceId, workspace.id));

    if (value >= 10) {
      return NextResponse.json(
        { error: "Testimonial limit reached. Upgrade to Indie for unlimited." },
        { status: 402 }
      );
    }
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const [testimonial] = await db
      .insert(testimonials)
      .values({
        workspaceId: workspace.id,
        ...parsed.data,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (err) {
    console.error("[testimonials POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — auth required
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace found" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  try {
    const conditions = [eq(testimonials.workspaceId, workspaceId)];
    if (status) {
      conditions.push(eq(testimonials.status, status));
    }

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(testimonials)
        .where(and(...conditions))
        .orderBy(desc(testimonials.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(testimonials)
        .where(and(...conditions)),
    ]);

    return NextResponse.json({
      testimonials: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[testimonials GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
