import { NextRequest, NextResponse } from "next/server";
import { db, testimonials, eq, and, desc, count, avg } from "@testimonialkit/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace found" }, { status: 400 });
  }

  try {
    const [totals] = await db
      .select({
        total: count(),
        avgRating: avg(testimonials.rating),
      })
      .from(testimonials)
      .where(eq(testimonials.workspaceId, workspaceId));

    const statusCounts = await db
      .select({
        status: testimonials.status,
        count: count(),
      })
      .from(testimonials)
      .where(eq(testimonials.workspaceId, workspaceId))
      .groupBy(testimonials.status);

    const [featuredCount] = await db
      .select({ count: count() })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.workspaceId, workspaceId),
          eq(testimonials.featured, true)
        )
      );

    const recentActivity = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.workspaceId, workspaceId))
      .orderBy(desc(testimonials.createdAt))
      .limit(5);

    const statusMap = statusCounts.reduce(
      (acc, row) => {
        acc[row.status] = row.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      total: totals.total,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      rejected: statusMap.rejected || 0,
      avgRating: totals.avgRating ? parseFloat(String(totals.avgRating)).toFixed(1) : null,
      featured: featuredCount.count,
      recentActivity,
    });
  } catch (err) {
    console.error("[stats GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
