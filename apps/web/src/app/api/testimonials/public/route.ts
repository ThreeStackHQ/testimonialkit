import { NextRequest, NextResponse } from "next/server";
import { db, testimonials, eq, and, desc } from "@testimonialkit/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required" },
      {
        status: 400,
        headers: corsHeaders(),
      }
    );
  }

  try {
    const items = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        email: testimonials.email,
        company: testimonials.company,
        role: testimonials.role,
        rating: testimonials.rating,
        text: testimonials.text,
        avatarUrl: testimonials.avatarUrl,
        featured: testimonials.featured,
        createdAt: testimonials.createdAt,
      })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.workspaceId, workspaceId),
          eq(testimonials.status, "approved")
        )
      )
      .orderBy(desc(testimonials.featured), desc(testimonials.createdAt))
      .limit(100);

    return NextResponse.json(
      { testimonials: items },
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[testimonials/public GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
